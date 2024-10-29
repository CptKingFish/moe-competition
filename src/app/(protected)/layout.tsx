import { redirect, usePathname } from "next/navigation";
import { Suspense } from "react";
import { getCurrentSession, logoutUser } from "@/lib/session";
import { Role as RoleTypes } from "@/db/enums";

import { AppSidebar } from "@/components/app-sidebar";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { TopNavigation } from "./_components/top-navigation";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const { user } = await getCurrentSession();
  // const router = ();

  if (!user?.id || !user?.role) {
    return logoutUser();
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
        <SidebarProvider>
          <AppSidebar user={user} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <TopNavigation />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
};

export default ProtectedLayout;
