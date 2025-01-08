"use client";

import { Button } from "@/components/ui/button";

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

import EditSchoolForm from "./edit-school-form";

const EditSchoolDialog = ({
  schoolId,
  schoolName,
}: {
  schoolId: string;
  schoolName: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="p-2">
          <Pencil size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit school</DialogTitle>
          <DialogDescription>
            Make updates to the school here. Click update when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <EditSchoolForm schoolId={schoolId} schoolName={schoolName} />
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolDialog;
