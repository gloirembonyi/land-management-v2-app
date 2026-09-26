import { redirect } from "next/navigation";

// The anomaly queue lives in the admin dashboard; keep the old address working.
export default function LegacyAnomaliesPage() {
  redirect("/admin/anomalies");
}
