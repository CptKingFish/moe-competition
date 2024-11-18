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

type ProjectTableItem = RouterOutputs["admin"]["getProjects"]["data"][0];

export const columns: ColumnDef<ProjectTableItem>[] = [
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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {category}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "subjectLevel",
    header: "Subject Level",
    cell: ({ row }) => {
      const subjectLevel = row.original.subjectLevel;
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {subjectLevel}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "competition",
    header: "Competition",
    cell: ({ row }) => {
      const competition = row.original.competition;
      return (
        <div>
          <Badge variant="outline" className="mr-2">
            {competition}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const authorName = row.original.author;
      const authorEmail = row.original.authorEmail;
      return (
        <>
          <Button className="p-0" variant="link">
            <Link href={`/admin/users/${row.original.id}`}>{authorName}</Link>
          </Button>
          <div className="font-light">{authorEmail}</div>
        </>
      );
    },
  },
  {
    accessorKey: "submittedBy",
    header: "Submitted By",
    cell: ({ row }) => {
      const submittedByName = row.original.submittedBy;
      const submittedByEmail = row.original.submittedByEmail;
      return (
        <>
          <Button className="p-0" variant="link">
            <Link href={`/admin/users/${row.original.id}`}>
              {submittedByName}
            </Link>
          </Button>
          <div className="font-light">{submittedByEmail}</div>
        </>
      );
    },
  },
];

export const searchableColumns: DataTableSearchableColumn<ProjectTableItem>[] =
  [
    {
      id: "name",
      placeholder: "Search by name",
    },
  ];

export const filterableColumns: DataTableFilterableColumn<ProjectTableItem>[] =
  [
    {
      id: "category",
      title: "Category",
    },
    {
      id: "subjectLevel",
      title: "Subject Level",
    },
    {
      id: "competition",
      title: "Competition",
    },
  ];
