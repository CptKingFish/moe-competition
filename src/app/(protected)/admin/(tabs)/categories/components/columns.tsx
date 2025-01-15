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
import EditCategoryDialog from "./edit-category-dialog";
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
  {
    id: "edit",
    header: "",
    cell: ({ row }) => {
      console.log("id", row.original.id);
      return (
        <EditCategoryDialog
          categoryId={row.original.id}
          categoryName={row.original.name}
        />
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
