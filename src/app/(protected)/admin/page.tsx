import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DataTable from "./components/data-table";
import { columns } from "./components/columns";
import { api } from "@/trpc/server";
import { type Role } from "@/db/enums";

const AdminPanelPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const {
    page: pageIndex,
    per_page: pageSize,
    sort: sortBy,
    name: searchName,
    role: strRoles,
    school: strSchoolIds,
  } = searchParams;

  const selectedRoles = strRoles ? (strRoles as string).split(",") : undefined;
  const selectedSchoolIds = strSchoolIds
    ? (strSchoolIds as string).split(",")
    : undefined;

  const { data, pageCount } = await api.admin.getAllUsers({
    pageIndex: Number(pageIndex) || 1,
    pageSize: Number(pageSize) || 10,
    sortBy: sortBy as string | undefined,
    searchName: searchName as string | undefined,
    selectedRoles: selectedRoles as Role[] | undefined,
    selectedSchoolIds,
  });

  return (
    <div className="container mx-auto">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mb-4">
            <DataTable columns={columns} data={data} pageCount={pageCount} />
          </div>
        </TabsContent>
        <TabsContent value="projects">
          <p>Projects content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
