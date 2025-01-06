"use client";

import { type ColumnDef } from "@tanstack/react-table";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/app/(protected)/teacher/components/data-table-column-header";

import {
  type DataTableFilterableColumn,
  type DataTableSearchableColumn,
} from "@/hooks/use-data-table";
import { type RouterOutputs } from "@/trpc/react";

import EditDialog from "./edit-dialog";

type ProjectTableItem = RouterOutputs["teacher"]["getProjectDrafts"]["data"][0];

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
          <Link href={`/projects/${row.original.id}`}>
            {row.getValue("name")}
          </Link>
        </Button>
      </>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = (row.original.category as string) ?? "Unassigned";
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
      const competition: string =
        (row.original.competition as string) ?? "Unassigned";
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
          <span className="font-medium">{authorName}</span>
          <div className="font-light">{authorEmail}</div>
        </>
      );
    },
  },
  {
    id: "edit",
    header: "",
    cell: ({ row }) => {
      // const competitionEndDate = row.original.competitionEndDate;

      // if (
      //   competitionEndDate !== null &&
      //   new Date(competitionEndDate) < new Date()
      // ) {
      //   return null;
      // }
      return <EditDialog submissionId={row.original.id} />;
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
