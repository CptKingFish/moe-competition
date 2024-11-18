"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const teacherTabOptions = [
  { value: "submissions", label: "My Submissions" },
  { value: "submit", label: "Submit" },
];

const TeacherTabs = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(pathname.split("/").pop());
  }, [pathname]);

  return (
    <Tabs className="mb-4" value={activeTab}>
      <TabsList>
        {teacherTabOptions.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            <Link href={`/teacher/${tab.value}`}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TeacherTabs;
