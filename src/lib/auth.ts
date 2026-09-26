import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "ubutaka_admin";

export type Role = "USER" | "NOTARY" | "ABUNZI" | "ADMIN";

export interface SessionUser {
  userId: string;
  email: string;
  role: Role;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return "ubutaka-dev-only-secret";
}

export function signToken(user: SessionUser, expiresIn: jwt.SignOptions["expiresIn"] = "7d"): string {
  return jwt.sign(user, getJwtSecret(), { expiresIn });
}

export function verifyToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionUser;
    return decoded?.userId ? decoded : null;
  } catch {
    return null;
  }
}

/** bcrypt hashes always start with $2a$, $2b$ or $2y$. */
export const isBcryptHash = (value: string) => /^\$2[aby]\$\d{2}\$/.test(value);

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);

/**
 * Compares a password against the stored value. Accounts created before hashing was
 * enforced may still hold a plain-text password; `needsRehash` tells the caller to
 * upgrade the stored value to a bcrypt hash after a successful login.
 */
export async function checkPassword(plain: string, stored: string): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (!stored) return { ok: false, needsRehash: false };
  if (isBcryptHash(stored)) return { ok: await bcrypt.compare(plain, stored), needsRehash: false };
  return { ok: plain === stored, needsRehash: plain === stored };
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/** Session from a mobile Bearer token or from the admin dashboard cookie. */
export function getSession(request: Request): SessionUser | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const user = verifyToken(auth.slice(7).trim());
    if (user) return user;
  }
  return verifyToken(readCookie(request, ADMIN_COOKIE));
}

/**
 * Guard for API route handlers. Returns the session, or a 401/403 response.
 * Usage: `const auth = requireAuth(request); if (auth instanceof NextResponse) return auth;`
 */
export function requireAuth(request: Request, roles?: Role[]): SessionUser | NextResponse {
  const user = getSession(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (roles && user.role !== "ADMIN" && !roles.includes(user.role)) {
    return NextResponse.json({ error: "You do not have permission to perform this action" }, { status: 403 });
  }
  return user;
}
