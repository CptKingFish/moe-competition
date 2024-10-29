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
  Map,
  PieChart,
  Settings2,
  ShieldHalf,
  Trophy,
} from "lucide-react";

import { NavGroup } from "@/components/nav-group";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/db/types";
import Image from "next/image";

// This is sample data.

// Can put switching G1, G2, G3 tracks here?
const teams = [
  {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
];

const navigation = [
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
    title: "Teachers",
    accessibleTo: ["TEACHER", "ADMIN"],
    items: [
      {
        title: "Teachers' Panel",
        url: "/teachers",
        icon: GraduationCap,
      },
    ],
  },
  {
    title: "Admins",
    accessibleTo: ["ADMIN"],
    items: [
      {
        title: "Admin Panel",
        url: "/admin",
        icon: ShieldHalf,
      },
    ],
  },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Image src="/Icon.svg" alt="Icon" width={120} height={100} />
        {/* <TeamSwitcher teams={teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((navGroup) => {
          if (!navGroup.accessibleTo.includes(user.role)) return null;
          return <NavGroup key={navGroup.title} {...navGroup} />;
        })}

        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
