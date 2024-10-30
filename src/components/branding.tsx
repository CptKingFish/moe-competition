import Image from "next/image";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function Branding({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Image
                src={imageUrl}
                alt="scratch"
                width={0}
                height={0}
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
            <div className="grid flex-1 text-left text-lg leading-tight">
              <span className="truncate font-semibold">{name}</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
