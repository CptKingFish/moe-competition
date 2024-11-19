import DataTable from "@/app/(protected)/teacher/(tabs)/submissions/components/data-table";
import { columns } from "@/app/(protected)/teacher/(tabs)/submissions/components/columns";
import { api } from "@/trpc/server";
import { type ApprovalStatus, type SubjectLevel } from "@/db/enums";

const SubmissionsTab = async ({
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
    approvedBy: strApprovedByStatus,
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

  const selectedApprovedStatus = strApprovedByStatus
    ? (strApprovedByStatus as string).split(",")
    : undefined;

  const { data, pageCount } = await api.teacher.getSubmittedProjects({
    pageIndex: Number(pageIndex) || 1,
    pageSize: Number(pageSize) || 10,
    sortBy: sortBy as string | undefined,
    searchName: searchName as string | undefined,
    selectedCompetitionIds,
    selectedSubjectLevels: selectedSubjectLevels as SubjectLevel[] | undefined,
    selectedCategoryIds,
    selectedApprovedStatus: selectedApprovedStatus as
      | ApprovalStatus[]
      | undefined,
  });

  return <DataTable columns={columns} data={data} pageCount={pageCount} />;
};

export default SubmissionsTab;
