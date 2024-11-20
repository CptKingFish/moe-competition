"use client";
import { navigation } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

type DashboardInfo = {
  section: string;
  path: string;
  label: string;
} | null;

export function TopNavigation() {
  const currentPath = usePathname();
  let dashboardInfo: { section: string; path: string; label: string } | null =
    null;
  console.log(currentPath);
  for (const navGroup of navigation) {
    // const item = navGroup.items.find((navItem) => navItem.url === currentPath);
    const item = navGroup.items.find((navItem) =>
      currentPath.includes(navItem.url),
    );

    if (item) {
      dashboardInfo = {
        section: navGroup.title,
        path: item.url,
        label: item.title,
      };
      break;
    } else if (/^\/projects(\/|$)/.test(currentPath)) {
      dashboardInfo = {
        section: "Main",
        path: currentPath,
        label: "Project",
      };
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{dashboardInfo?.section}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbLink href={dashboardInfo?.path}>
            {dashboardInfo?.label} Page
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
