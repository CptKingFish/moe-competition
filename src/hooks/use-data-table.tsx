"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { z } from "zod";
import useDebounce from "./use-debounce";

export interface DataTableSearchableColumn<TData> {
  id: keyof TData;
  placeholder?: string;
}

export interface DataTableFilterableColumn<TData> {
  id: keyof TData;
  title: string;
  // options: {
  //   label: string;
  //   value: string;
  //   icon?: React.ComponentType<{ className?: string }>;
  // }[];
}

interface UseDataTableProps<TData, TValue> {
  /**
   * The data for the table.
   * @default []
   * @type TData[]
   */
  data: TData[];

  /**
   * The columns of the table.
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * The number of pages in the table.
   * @type number
   */
  pageCount: number;

  /**
   * The searchable columns of the table.
   * @default []
   * @type {id: keyof TData, title: string}[]
   * @example searchableColumns={[{ id: "title", title: "titles" }]}
   */
  searchableColumns?: DataTableSearchableColumn<TData>[];

  /**
   * The filterable columns of the table. When provided, renders dynamic faceted filters, and the advancedFilter prop is ignored.
   * @default []
   * @type {id: keyof TData, title: string, options: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[]}[]
   * @example filterableColumns={[{ id: "status", title: "Status", options: ["todo", "in-progress", "done", "canceled"]}]}
   */
  filterableColumns?: DataTableFilterableColumn<TData>[];
}

const schema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(10),
  sort: z.string().optional(),
});

const useDataTable = <TData, TValue>({
  data,
  columns,
  pageCount,
  searchableColumns = [],
  filterableColumns = [],
}: UseDataTableProps<TData, TValue>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search params
  const { page, perPage, sort } = schema.parse(
    Object.fromEntries(searchParams),
  );
  const [column, order] = sort?.split(".") ?? [];

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      const queryString = Array.from(Object.entries(params)).reduce(
        (acc, [key, value]) => {
          if (value === null) {
            acc.delete(key);
          } else {
            acc.set(key, String(value));
          }
          return acc;
        },
        newSearchParams,
      );

      return queryString.toString();
    },
    [searchParams],
  );

  // Initial column filters
  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    return Array.from(searchParams.entries()).reduce<ColumnFiltersState>(
      (filters, [key, value]) => {
        const filterableColumn = filterableColumns.find(
          (filteredColumn) => filteredColumn.id === key,
        );
        const searchableColumn = searchableColumns.find(
          (filteredColumn) => filteredColumn.id === key,
        );

        if (filterableColumn) {
          filters.push({
            id: key,
            value: value.split(","),
          });
        } else if (searchableColumn) {
          filters.push({
            id: key,
            value: [value],
          });
        }

        return filters;
      },
      [],
    );
  }, [filterableColumns, searchableColumns, searchParams]);

  // Table states
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: perPage,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  // Handle server-side sorting
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: column ?? "",
      desc: order === "desc",
    },
  ]);

  // Handle server-side filtering
  const debouncedSearchableColumnFilters = JSON.parse(
    useDebounce(
      JSON.stringify(
        columnFilters.filter((filter) => {
          return searchableColumns.some(
            (searchedColumn) => searchedColumn.id === filter.id,
          );
        }),
      ),
      500,
    ),
  ) as ColumnFiltersState;

  const filterableColumnFilters = columnFilters.filter((filter) => {
    console.log("columnFilters", columnFilters);
    console.log("filterableColumns", filterableColumns);

    return filterableColumns.some(
      (filteredColumn) => filteredColumn.id === filter.id,
    );
  });

  // Initialize new params
  const newParamsObject = {
    page: pageIndex + 1,
    per_page: pageSize,
    sort: sorting[0]?.id
      ? `${sorting[0]?.id}.${sorting[0]?.desc ? "desc" : "asc"}`
      : null,
  };

  // Handle debounced searchable column filters
  debouncedSearchableColumnFilters.forEach((searchColumn) => {
    if (typeof searchColumn.value === "string") {
      Object.assign(newParamsObject, {
        [searchColumn.id]: searchColumn.value,
      });
    }
  });

  console.log("filterableColumnFilters", filterableColumnFilters);

  // Handle filterable column filters
  filterableColumnFilters.forEach((filterColumn) => {
    console.log(filterColumn);

    if (
      typeof filterColumn.value === "object" &&
      Array.isArray(filterColumn.value)
    ) {
      Object.assign(newParamsObject, {
        [filterColumn.id]: filterColumn.value.join(","),
      });
    }
  });

  // Remove deleted values
  [...searchParams.keys()].forEach((key) => {
    const isSearchableAndNotDebounced =
      searchableColumns.some((searchedColumn) => searchedColumn.id === key) &&
      !debouncedSearchableColumnFilters.some(
        (searchedColumn) => searchedColumn.id === key,
      );

    const isFilterableAndNotFiltered =
      filterableColumns.some((filteredColumn) => filteredColumn.id === key) &&
      !filterableColumnFilters.some(
        (filteredColumn) => filteredColumn.id === key,
      );

    if (isSearchableAndNotDebounced || isFilterableAndNotFiltered) {
      Object.assign(newParamsObject, { [key]: null });
    }
  });
  console.log(newParamsObject);

  // Update URL with new params
  const currentUrl = `${pathname}?${createQueryString(newParamsObject)}`;

  useEffect(() => {
    router.replace(currentUrl, { scroll: false });
  }, [currentUrl, router]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
      sorting,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table };
};

export default useDataTable;
