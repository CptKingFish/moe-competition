import { type Role } from "@/db/enums";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import TeacherTabs from "./components/teacher-tabs";

// /teacher/* routes will be wrapped with this layout

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getCurrentSession();
  const allowedRoles: Role[] = ["TEACHER", "ADMIN"];

  if (!session.user) return redirect("/");
  const userRole = session.user.role;
  const userSchoolId = session.user.schoolId;
  if (!allowedRoles.includes(userRole)) return redirect("/");

  return (
    <main>
      <TeacherTabs userRole={userRole} userSchoolId={userSchoolId} />
      {children}
    </main>
  );
};

export default TeacherLayout;
