import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/trpc/server";
import { type Role } from "@/db/enums";
import SubmitForm from "./components/submit-form";
import ImageUpload from "./components/image-upload";

const TeacherPanelPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const projectData = await api.projects.getProjectById(
    "sr2xguzhbx31192ip88xxh1u",
  );
  const projectCategories = await api.projects.getProjectCategories();
  const competitions = await api.projects.getCompetitions();
  console.log(projectData);

  // const {
  //   page: pageIndex,
  //   per_page: pageSize,
  //   sort: sortBy,
  //   name: searchName,
  //   role: strRoles,
  //   school: strSchoolIds,
  // } = searchParams;

  // const selectedRoles = strRoles ? (strRoles as string).split(",") : undefined;
  // const selectedSchoolIds = strSchoolIds
  //   ? (strSchoolIds as string).split(",")
  //   : undefined;

  // const { data, pageCount } = await api.admin.getUsers({
  //   pageIndex: Number(pageIndex) || 1,
  //   pageSize: Number(pageSize) || 10,
  //   sortBy: sortBy as string | undefined,
  //   searchName: searchName as string | undefined,
  //   selectedRoles: selectedRoles as Role[] | undefined,
  //   selectedSchoolIds,
  // });

  return (
    <div>
      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="submit">Submit</TabsTrigger>
        </TabsList>
        <TabsContent value="submissions">
          <div className="mb-4">
            {/* <DataTable columns={columns} data={data} pageCount={pageCount} /> */}
            {/* <p>Submissions content goes here.</p> */}
            {projectData.imageSrc && (
              <img src={projectData.imageSrc} alt="Project Banner" />
            )}
          </div>
        </TabsContent>
        <TabsContent value="submit">
          <SubmitForm
            projectCategories={projectCategories}
            competitions={competitions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherPanelPage;
