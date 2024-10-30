"use client";

import { type ColumnDef } from "@tanstack/react-table";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "./data-table-column-header";

import { type User } from "@/db/types";
import {
  type DataTableFilterableColumn,
  type DataTableSearchableColumn,
} from "../hooks/use-data-table";

export type UserTableItem = Pick<
  User,
  "id" | "picture" | "name" | "email" | "role"
> & {
  school: string;
};

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
    accessorKey: "school",
    header: "School",
    cell: ({ row }) => {
      const school = Object.values(row.original.school);
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
    id: "roles",
    title: "Roles",
  },
  {
    id: "schools",
    title: "Schools",
  },
];
