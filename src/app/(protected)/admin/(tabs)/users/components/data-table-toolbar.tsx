"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Role } from "@/db/enums";
import DataTableFacetedFilter from "@/app/(protected)/admin/components/data-table-faceted-filter";
import { api } from "@/trpc/react";
import AssignSpecialRoleDialog from "./assign-special-role-dialog";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { data: schoolsData } = api.admin.getAllSchoolNames.useQuery();

  const formattedSchools = useMemo(() => {
    if (!schoolsData) {
      return [];
    }

    return schoolsData.map((school) => ({
      label: school.name,
      value: school.id,
    }));
  }, [schoolsData]);

  const roleOptions = Object.values(Role).map((role) => ({
    label: role,
    value: role,
  }));

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
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Role"
            options={roleOptions}
            table={table}
          />
        )}
        {table.getColumn("school") && (
          <DataTableFacetedFilter
            column={table.getColumn("school")}
            title="School"
            options={formattedSchools}
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
      <AssignSpecialRoleDialog />
    </div>
  );
};

export default DataTableToolbar;
