"use client";

import { type ColumnDef } from "@tanstack/react-table";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/app/(protected)/admin/components/data-table-column-header";

import {
  type DataTableFilterableColumn,
  type DataTableSearchableColumn,
} from "@/hooks/use-data-table";
import { type RouterOutputs } from "@/trpc/react";
type CompetitionTableItem =
  RouterOutputs["admin"]["getCompetitions"]["data"][0];

export const columns: ColumnDef<CompetitionTableItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Name" className="p-0" />
      );
    },
    cell: ({ row }) => (
      <>
        <Button className="p-0" variant="link">
          <Link href={`/admin/users/${row.original.id}`}>
            {row.getValue("name")}
          </Link>
        </Button>
        {/* <div className="font-light">{row.original.id}</div> */}
      </>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      const createdByEmail = row.original.createdByEmail;
      return (
        <>
          <span className="font-medium">{createdBy}</span>
          <div className="font-light">{createdByEmail}</div>
        </>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate = row.original.startDate.toUTCString().slice(0, -13);
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {startDate}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = row.original.endDate.toUTCString().slice(0, -13);
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {endDate}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "totalProjects",
    header: "Total Projects",
    cell: ({ row }) => {
      const totalProjects = row.original.totalProjects;
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {totalProjects}
          </Badge>
        </div>
      );
    },
  },
];

export const searchableColumns: DataTableSearchableColumn<CompetitionTableItem>[] =
  [
    {
      id: "name",
      placeholder: "Search by name",
    },
  ];

export const filterableColumns: DataTableFilterableColumn<CompetitionTableItem>[] =
  [];
