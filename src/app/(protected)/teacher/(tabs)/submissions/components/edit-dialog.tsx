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

import UpdateSubmissionForm from "./update-submission-form";

const EditDialog = ({ submissionId }: { submissionId: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="p-2">
          <Pencil size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-10/12 sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit submission</DialogTitle>
          <DialogDescription>
            Make changes to your submission here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <UpdateSubmissionForm submissionId={submissionId} />
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
