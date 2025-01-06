"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  History,
  Home,
  LucideIcon,
  Map,
  PieChart,
  Settings2,
  ShieldHalf,
  Trophy,
} from "lucide-react";

import { NavGroup } from "@/components/nav-group";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { Branding } from "@/components/branding";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/db/types";

type NavigationItem = {
  url: string;
  title: string;
  icon: LucideIcon;
  isActive?: boolean;
  accessibleTo?: string[];
};

type NavigationGroup = {
  title: string;
  accessibleTo: string[];
  items: NavigationItem[];
};

type Navigation = NavigationGroup[];

export const navigation: Navigation = [
  {
    title: "Main",
    accessibleTo: ["STUDENT", "TEACHER", "ADMIN"],
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isActive: true,
      },
      {
        title: "Leaderboards",
        url: "/leaderboards",
        icon: Trophy,
      },
    ],
  },
  {
    title: "Management",
    accessibleTo: ["TEACHER", "ADMIN"],
    items: [
      {
        title: "Teachers' Panel",
        url: "/teacher/submissions",
        icon: GraduationCap,
      },
      {
        title: "Admin Panel",
        url: "/admin/users",
        icon: ShieldHalf,
        accessibleTo: ["ADMIN"],
      },
    ],
  },
];

const teams = [
  {
    name: "ScratchOff!",
    logo: GalleryVerticalEnd,
    plan: "Free",
  },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Branding name="ScratchOff!" imageUrl="/scratch.svg" />
      </SidebarHeader>
      <SidebarContent>
        {navigation
          .filter((navGroup) => navGroup.accessibleTo.includes(user.role))
          .map((navGroup) => (
            <NavGroup
              key={navGroup.title}
              title={navGroup.title}
              items={navGroup.items
                .filter(
                  (item) =>
                    !item.accessibleTo || item.accessibleTo.includes(user.role),
                )
                .map((item) => ({
                  ...item,
                  icon: item.icon,
                }))}
            />
          ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
