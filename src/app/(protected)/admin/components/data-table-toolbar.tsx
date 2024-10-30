"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import roles from "./roles";
import DataTableFacetedFilter from "./data-table-faceted-filter";
import { api } from "@/trpc/react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0;
  // const { data: organisationsData } =
  //   api.organisation.getAllOrganisationNames.useQuery();

  // const formattedOrganisations = useMemo(() => {
  //   if (!organisationsData) {
  //     return [];
  //   }

  //   return organisationsData.map((organisation) => ({
  //     label: organisation.name,
  //     value: organisation.id,
  //   }));
  // }, [organisationsData]);
  const formattedOrganisations = [
    {
      label: "Organisation 1",
      value: "1",
    },
  ];
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Search
          placeholder="Search"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          // usually we would want to separate a function outside of the component but for one liner code, we will just use inline function
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("roles") && (
          <DataTableFacetedFilter
            column={table.getColumn("roles")}
            title="Roles"
            options={roles}
            table={table}
          />
        )}
        {table.getColumn("organisations") && (
          <DataTableFacetedFilter
            column={table.getColumn("organisations")}
            title="Organisations"
            options={formattedOrganisations}
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
