import { type Role } from "@/db/enums";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

// /teacher/* routes will be wrapped with this layout

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getCurrentSession();
  const allowedRoles: Role[] = ["TEACHER", "ADMIN"];

  if (!session.user) return redirect("/");
  const userRole = session.user.role;
  if (!allowedRoles.includes(userRole)) return redirect("/");

  return <main className="p-8">{children}</main>;
};

export default TeacherLayout;
