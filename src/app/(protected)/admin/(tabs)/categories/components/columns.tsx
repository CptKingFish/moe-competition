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
type CategoriesTableItem =
  RouterOutputs["admin"]["getProjectCategories"]["data"][0];

export const columns: ColumnDef<CategoriesTableItem>[] = [
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

export const searchableColumns: DataTableSearchableColumn<CategoriesTableItem>[] =
  [
    {
      id: "name",
      placeholder: "Search by name",
    },
  ];

export const filterableColumns: DataTableFilterableColumn<CategoriesTableItem>[] =
  [];
