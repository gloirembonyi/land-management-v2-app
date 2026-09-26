// Every user field except the password hash.
export const userSelect = {
  id: true, name: true, email: true, nationalId: true, role: true, isVerified: true, avatar: true,
  district: true, sector: true, cell: true, village: true, biometricRegistered: true, digitalSignature: true,
  idPictureUrl: true, profileCompleted: true, createdAt: true, updatedAt: true,
} as const;
