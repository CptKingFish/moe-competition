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
import { Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import UpdateSubmissionForm from "./update-submission-form";

const EditDialog = ({ submissionId }: { submissionId: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="p-2">
          <Pencil size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-11/12 sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit submission</DialogTitle>
          <DialogDescription>
            Make changes to your submission here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <UpdateSubmissionForm submissionId={submissionId} />
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
