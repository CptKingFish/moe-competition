import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import UsersTab from "./tabs/users/users-tab";

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
          <p>Projects content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
