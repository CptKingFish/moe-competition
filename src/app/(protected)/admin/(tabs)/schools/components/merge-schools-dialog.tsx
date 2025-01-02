"use client";

import { Button } from "@/components/ui/button";

import { Merge } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import MergeSchoolsForm from "./merge-schools-form";

const MergeSchoolsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="p-2">
          <Merge size={20} /> Merge Schools
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Merge Schools</DialogTitle>
          <DialogDescription>
            Merge a school to another school.
          </DialogDescription>
          <DialogDescription className="text-red-600">
            WARNING: Students from the merged schools will be assigned to the
            new school, and the original school will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <MergeSchoolsForm />
      </DialogContent>
    </Dialog>
  );
};

export default MergeSchoolsDialog;
