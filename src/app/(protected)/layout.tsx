import { redirect } from "next/navigation";
import { getCurrentSession, logoutUser } from "@/lib/session";
import { Role as RoleTypes } from "@/db/enums";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TopNavigation } from "./_components/top-navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const { user } = await getCurrentSession();

  if (!user?.id || !user?.role) {
    return logoutUser();
  }

  const userRole = user.role;

  if (!Object.values(RoleTypes).includes(userRole)) return redirect("/");

  if (user.schoolId === null) return redirect("/select-school");

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <div className="flex h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <TopNavigation />
          </div>
        </header>
        <ScrollArea className="h-[calc(100vh-4rem)] flex-1 overflow-x-auto overflow-y-auto p-4">
          <div className="container mx-auto">{children}</div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
