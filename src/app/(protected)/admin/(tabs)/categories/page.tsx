import DataTable from "@/app/(protected)/admin/(tabs)/categories/components/data-table";
import { columns } from "@/app/(protected)/admin/(tabs)/categories/components/columns";
import { api } from "@/trpc/server";

const CategoriesTab = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const {
    page: pageIndex,
    per_page: pageSize,
    sort: sortBy,
    name: searchName,
  } = searchParams;

  const { data, pageCount } = await api.admin.getProjectCategories({
    pageIndex: Number(pageIndex) || 1,
    pageSize: Number(pageSize) || 10,
    sortBy: sortBy as string | undefined,
    searchName: searchName as string | undefined,
  });

  return <DataTable columns={columns} data={data} pageCount={pageCount} />;
};

export default CategoriesTab;
