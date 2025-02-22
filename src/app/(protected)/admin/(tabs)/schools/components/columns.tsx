"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/app/(protected)/admin/components/data-table-column-header";

import {
  type DataTableFilterableColumn,
  type DataTableSearchableColumn,
} from "@/hooks/use-data-table";
import { type RouterOutputs } from "@/trpc/react";
import EditSchoolDialog from "./edit-school-dialog";
type SchoolsTableItem = RouterOutputs["admin"]["getSchools"]["data"][0];

export const columns: ColumnDef<SchoolsTableItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Name" className="p-0" />
      );
    },
    cell: ({ row }) => {
      const name = row.original.name;
      return (
        <>
          <span className="font-medium">{name}</span>
        </>
      );
    },
  },
  {
    accessorKey: "shortname",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="Short Name"
          className="p-0"
        />
      );
    },
    cell: ({ row }) => {
      const shortname = row.original.shortname;
      return (
        <>
          <span className="font-medium">{shortname}</span>
        </>
      );
    },
  },
  {
    accessorKey: "totalUsers",
    header: "Total Users",
    cell: ({ row }) => {
      const totalUsers = row.original.totalUsers;
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {totalUsers}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "edit",
    header: "",
    cell: ({ row }) => {
      return (
        <EditSchoolDialog
          schoolId={row.original.id}
          schoolName={row.original.name}
          shortname={row.original.shortname}
        />
      );
    },
  },
];

export const searchableColumns: DataTableSearchableColumn<SchoolsTableItem>[] =
  [
    {
      id: "name",
      placeholder: "Search by name",
    },
  ];

export const filterableColumns: DataTableFilterableColumn<SchoolsTableItem>[] =
  [];
