"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminTabOptions = [
  { value: "users", label: "Users" },
  { value: "projects", label: "Projects" },
];

const AdminTabs = () => {
  const pathname = usePathname();

  return (
    <Tabs className="mb-4" defaultValue={pathname.split("/").pop()}>
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
