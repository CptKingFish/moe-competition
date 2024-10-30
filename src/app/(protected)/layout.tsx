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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
      <body className="flex h-screen font-sans">
        <SidebarProvider>
          <AppSidebar user={user}className="z-20" />
          <div className="flex flex-1 flex-col">
            <header className="sticky border-b top-0 flex h-16 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <TopNavigation />
              </div>
            </header>
            <ScrollArea className="flex-1 overflow-auto p-4 pt-4">
              <div>{children}</div>
            </ScrollArea>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
};

export default ProtectedLayout;
