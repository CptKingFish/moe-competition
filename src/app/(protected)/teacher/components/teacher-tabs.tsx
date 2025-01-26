"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Router } from "lucide-react";
import { api } from "@/trpc/react";
import { Role } from "@/db/enums";

const teacherTabOptions = [
  { value: "submissions", label: "School's Submissions" },
  { value: "drafts", label: "Drafts" },
  { value: "submit", label: "Submit" },
];

const TeacherTabs = ({
  userRole,
  userSchoolId,
}: {
  userRole: Role;
  userSchoolId: string | null;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [openAdminSchoolSelection, setOpenAdminSchoolSelection] =
    useState(false);

  const [schools, setSchools] = useState<{ label: string; value: string }[]>(
    [],
  );

  const [selectedAdminSchool, setSelectedAdminSchool] = useState<
    | {
        value: string;
        label: string;
      }
    | undefined
  >(undefined);

  const { data: schoolData, isFetched } =
    api.school.getAllSchoolNames.useQuery();

  const { mutateAsync: updateAssignedSchool } =
    api.admin.updateAssignedSchool.useMutation();

  useEffect(() => {
    if (isFetched && schoolData) {
      const formattedSchoolData = schoolData.map((school) => ({
        label: school.name,
        value: school.id,
      }));
      setSchools(formattedSchoolData);
    }
  }, [isFetched, schoolData]);

  useEffect(() => {
    // if userSchoolId is changed, update selectedAdminSchool
    if (!userSchoolId) return;

    if (userRole === "ADMIN") {
      const schoolName = schools.find(
        (school) => school.value === userSchoolId,
      )?.label;
      if (schoolName) {
        setSelectedAdminSchool({
          label: schoolName,
          value: userSchoolId,
        });
      }
    }
  }, [userSchoolId, userRole, schools]);

  useEffect(() => {
    setActiveTab(pathname.split("/").pop());
  }, [pathname]);

  const updateAdminAssignedSchool = async (schoolId: string) => {
    await updateAssignedSchool({ schoolId });
    router.refresh();
  };

  return (
    <div>
      {userRole === "ADMIN" ? (
        <Popover
          open={openAdminSchoolSelection}
          onOpenChange={setOpenAdminSchoolSelection}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "mb-3 w-full justify-between",
                !selectedAdminSchool?.value && "text-muted-foreground",
              )}
            >
              {selectedAdminSchool?.value
                ? `Assuming role of teacher from: ${
                    schools?.find(
                      (school) => school.value === selectedAdminSchool.value,
                    )?.label
                  }`
                : "Choose a school to assume the role of a teacher from the school."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search School..." />
              <CommandList>
                <CommandEmpty>No schools found.</CommandEmpty>
                <CommandGroup>
                  {schools?.map((school) => (
                    <CommandItem
                      value={school.label}
                      key={school.value}
                      onSelect={() => {
                        setSelectedAdminSchool({
                          label: school.label,
                          value: school.value,
                        });
                        setOpenAdminSchoolSelection(false);
                        updateAdminAssignedSchool(school.value);
                      }}
                    >
                      {school.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          school.value === selectedAdminSchool?.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : null}

      <Tabs className="mb-4" value={activeTab}>
        <TabsList>
          {teacherTabOptions.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <Link href={`/teacher/${tab.value}`}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TeacherTabs;
