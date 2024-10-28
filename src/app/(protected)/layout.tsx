import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getCurrentSession } from "@/lib/session";
import { Role as RoleTypes } from "@/db/enums";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const { user } = await getCurrentSession();

  if (!user?.id || !user?.role) {
    cookies().delete("session");
    redirect("/");
  }

  const userRole = user.role;

  if (!Object.values(RoleTypes).includes(userRole)) return redirect("/");

  //   let navBarItems: SideBarItemType[] = [];

  //   if (userRole === "ADMIN") {
  //     navBarItems = adminMainNavItems;
  //   } else if (userRole === "TEACHER") {
  //     navBarItems = teacherMainNavItems;
  //   } else if (userRole === "STUDENT") {
  //     navBarItems = studentMainNavItems;
  //   }

  return (
    <html lang="en">
      <body className="flex h-screen flex-col font-sans">
        {/* <Suspense fallback={<div>Loading...</div>}>
          <NavBar navBarItems={navBarItems} session={session} />
        </Suspense> */}
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden h-full overflow-hidden md:block">
            {/* <Suspense fallback={<div>Loading...</div>}>
              <SideBar role={currentRole} id={session.user.id} />
            </Suspense> */}
          </div>
          <div className="bg-light-purple flex-1 overflow-y-auto">
            <main className="container mx-auto pt-5">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
};

export default ProtectedLayout;
