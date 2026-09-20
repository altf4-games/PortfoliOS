import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboard userLogin={session.user?.login ?? session.user?.name ?? "unknown"} />;
}
