"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const adminTabOptions = [
  { value: "users", label: "Users" },
  { value: "projects", label: "Projects" },
  { value: "competitions", label: "Competitions" },
  { value: "categories", label: "Categories" },
  { value: "schools", label: "Schools" },
];

const AdminTabs = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(pathname.split("/").pop());
  }, [pathname]);

  return (
    <Tabs className="mb-4" value={activeTab}>
      <TabsList>
        {adminTabOptions.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            <Link href={`/admin/${tab.value}`}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default AdminTabs;
