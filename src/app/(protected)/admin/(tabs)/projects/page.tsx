import DataTable from "@/app/(protected)/admin/(tabs)/projects/components/data-table";
import { columns } from "@/app/(protected)/admin/(tabs)/projects/components/columns";
import { api } from "@/trpc/server";
import { type SubjectLevel } from "@/db/enums";

const ProjectsTab = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const {
    page: pageIndex,
    per_page: pageSize,
    sort: sortBy,
    name: searchName,
    competition: strCompetitionIds,
    subjectLevel: strSubjectLevels,
    category: strCategoryIds,
  } = searchParams;

  const selectedSubjectLevels = strSubjectLevels
    ? (strSubjectLevels as string).split(",")
    : undefined;
  const selectedCompetitionIds = strCompetitionIds
    ? (strCompetitionIds as string).split(",")
    : undefined;
  const selectedCategoryIds = strCategoryIds
    ? (strCategoryIds as string).split(",")
    : undefined;

  const { data, pageCount } = await api.admin.getProjects({
    pageIndex: Number(pageIndex) || 1,
    pageSize: Number(pageSize) || 10,
    sortBy: sortBy as string | undefined,
    searchName: searchName as string | undefined,
    selectedCompetitionIds,
    selectedSubjectLevels: selectedSubjectLevels as SubjectLevel[] | undefined,
    selectedCategoryIds,
  });

  return <DataTable columns={columns} data={data} pageCount={pageCount} />;
};

export default ProjectsTab;
