"use client";

import { type ColumnDef } from "@tanstack/react-table";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/app/(protected)/admin/components/data-table-column-header";

import { type User } from "@/db/types";
import {
  type DataTableFilterableColumn,
  type DataTableSearchableColumn,
} from "@/hooks/use-data-table";
import { RouterOutputs } from "@/trpc/react";

type UserTableItem = RouterOutputs["admin"]["getUsers"]["data"][0];

export const columns: ColumnDef<UserTableItem>[] = [
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
        <div className="font-light">{row.original.email}</div>
      </>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {email}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "school",
    header: "School",
    cell: ({ row }) => {
      const school = row.original.school ?? "N/A";
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {school}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = Object.values(row.original.role);
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {role}
          </Badge>
        </div>
      );
    },
  },
];

export const searchableColumns: DataTableSearchableColumn<UserTableItem>[] = [
  {
    id: "name",
    placeholder: "Search by name",
  },
];

export const filterableColumns: DataTableFilterableColumn<UserTableItem>[] = [
  {
    id: "role",
    title: "Role",
  },
  {
    id: "school",
    title: "School",
  },
];
