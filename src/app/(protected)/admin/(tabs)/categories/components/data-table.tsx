"use client";

import { type ColumnDef, flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import DataTablePagination from "@/app/(protected)/admin/components/data-table-pagination";
import DataTableToolbar from "@/app/(protected)/admin/(tabs)/categories/components/data-table-toolbar";
import useDataTable from "@/hooks/use-data-table";
import { searchableColumns, filterableColumns } from "./columns";

import { type RouterOutputs } from "@/trpc/react";

type CategoriesTableItem =
  RouterOutputs["admin"]["getProjectCategories"]["data"][0];

type DataTableProps<TValue> = {
  columns: ColumnDef<CategoriesTableItem, TValue>[];
  data: RouterOutputs["admin"]["getProjectCategories"]["data"];
  pageCount: RouterOutputs["admin"]["getProjectCategories"]["pageCount"];
};

const DataTable = <TValue,>({
  columns,
  data,
  pageCount,
}: DataTableProps<TValue>) => {
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    searchableColumns,
    filterableColumns,
  });
  return (
    <>
      <DataTableToolbar table={table} />
      <div className="mt-5 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </>
  );
};

export default DataTable;
