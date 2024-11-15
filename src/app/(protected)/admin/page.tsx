import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import UsersTab from "./tabs/users/users-tab";
import ProjectsTab from "./tabs/projects/projects-tab";

const AdminPanelPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  return (
    <div>
      <Tabs defaultValue="users">
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
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
