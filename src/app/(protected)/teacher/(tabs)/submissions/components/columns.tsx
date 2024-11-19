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

type ProjectTableItem =
  RouterOutputs["teacher"]["getSubmittedProjects"]["data"][0];

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
          <span className="font-medium">{authorName}</span>
          <div className="font-light">{authorEmail}</div>
        </>
      );
    },
  },
  // {
  //   accessorKey: "submittedBy",
  //   header: "Submitted By",
  //   cell: ({ row }) => {
  //     const submittedByName = row.original.submittedBy;
  //     const submittedByEmail = row.original.submittedByEmail;
  //     return (
  //       <>
  //         <span className="font-medium">{submittedByName}</span>
  //         <div className="font-light">{submittedByEmail}</div>
  //       </>
  //     );
  //   },
  // },
  {
    accessorKey: "approvalStatus",
    header: "Approval Status",
    cell: ({ row }) => {
      const approvalStatus = row.original.approvalStatus;
      let variant: "outline" | "default" | "destructive" = "outline";
      if (approvalStatus === "PENDING") {
        variant = "outline";
      } else if (approvalStatus === "APPROVED") {
        variant = "default";
      } else if (approvalStatus === "REJECTED") {
        variant = "destructive";
      }

      return (
        <div>
          <Badge variant={variant} className="mr-2">
            {approvalStatus}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "approver",
    header: "Approver",
    cell: ({ row }) => {
      const approver = row.original.approver;
      const approverEmail = row.original.approverEmail;
      return (
        <>
          {approver && approverEmail ? (
            <>
              <span className="font-medium">{approver}</span>
              <div className="font-light">{approverEmail}</div>
            </>
          ) : (
            <div className="text-muted-foreground">Not approved</div>
          )}
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
    {
      id: "approvalStatus",
      title: "Approval Status",
    },
  ];
