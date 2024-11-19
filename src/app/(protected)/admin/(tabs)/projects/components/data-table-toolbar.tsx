"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { ApprovalStatus, SubjectLevel } from "@/db/enums";
import DataTableFacetedFilter from "@/app/(protected)/admin/components/data-table-faceted-filter";
import { api } from "@/trpc/react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { data: categoriesData } = api.projects.getProjectCategories.useQuery();
  const { data: competitionsData } = api.projects.getCompetitions.useQuery();

  const subjectLevelOptions = Object.values(SubjectLevel).map(
    (subjectLevel) => ({
      label: subjectLevel,
      value: subjectLevel,
    }),
  );

  const approvedStatusOptions = Object.values(ApprovalStatus).map(
    (approvalStatus) => ({
      label: approvalStatus,
      value: approvalStatus,
    }),
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Search
          placeholder="Search by name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          // usually we would want to separate a function outside of the component but for one liner code, we will just use inline function
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("subjectLevel") && (
          <DataTableFacetedFilter
            column={table.getColumn("subjectLevel")}
            title="Subject Level"
            options={subjectLevelOptions}
            table={table}
          />
        )}
        {table.getColumn("category") && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Category"
            options={categoriesData ?? []}
            table={table}
          />
        )}
        {table.getColumn("competition") && (
          <DataTableFacetedFilter
            column={table.getColumn("competition")}
            title="Competition"
            options={competitionsData ?? []}
            table={table}
          />
        )}
        {table.getColumn("approvalStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("approvalStatus")}
            title="Approval Status"
            options={approvedStatusOptions}
            table={table}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DataTableToolbar;
