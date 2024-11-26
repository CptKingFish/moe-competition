import { type Role } from "@/db/enums";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

const SelectSchoolLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await getCurrentSession();
  const allowedRoles: Role[] = ["TEACHER", "STUDENT"];

  if (!session.user) return redirect("/");
  const userRole = session.user.role;
  if (!allowedRoles.includes(userRole)) return redirect("/");

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      {children}
    </div>
  );
};

export default SelectSchoolLayout;
