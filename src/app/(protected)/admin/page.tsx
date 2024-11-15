import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { redirect } from "next/navigation";
const AdminPanelPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  redirect("/admin/users");
  return (
    <div>
      {/* <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mb-4">
            <UsersTab searchParams={searchParams} />
          </div>
        </TabsContent>
        <TabsContent value="projects">
          <div className="mb-4">
            <ProjectsTab searchParams={searchParams} />
          </div>
        </TabsContent>
      </Tabs> */}
    </div>
  );
};

export default AdminPanelPage;
