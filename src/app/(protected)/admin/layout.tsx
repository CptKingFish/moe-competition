import { type Role } from "@/db/enums";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminTabs from "./components/admin-tabs";

// /admin/* routes will be wrapped with this layout

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getCurrentSession();
  const allowedRoles: Role[] = ["ADMIN"];

  if (!session.user) return redirect("/");
  const userRole = session.user.role;
  if (!allowedRoles.includes(userRole)) return redirect("/");

  return (
    <main>
      <AdminTabs />
      {children}
    </main>
  );
};

export default AdminLayout;
