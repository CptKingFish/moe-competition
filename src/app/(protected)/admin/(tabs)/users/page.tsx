import DataTable from "@/app/(protected)/admin/(tabs)/users/components/data-table";
import { columns } from "@/app/(protected)/admin/(tabs)/users/components/columns";
import { api } from "@/trpc/server";
import { type Role } from "@/db/enums";

const UsersTab = async ({
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

  const { data, pageCount } = await api.admin.getUsers({
    pageIndex: Number(pageIndex) || 1,
    pageSize: Number(pageSize) || 10,
    sortBy: sortBy as string | undefined,
    searchName: searchName as string | undefined,
    selectedRoles: selectedRoles as Role[] | undefined,
    selectedSchoolIds,
  });

  return <DataTable columns={columns} data={data} pageCount={pageCount} />;
};

export default UsersTab;
