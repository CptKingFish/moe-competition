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

import UpdateDraftForm from "./update-draft-form";

const EditDialog = ({ draftId }: { draftId: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="p-2">
          <Pencil size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit draft</DialogTitle>
          <DialogDescription>
            Make changes to your draft here. You are able to submit it as a
            project or save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <UpdateDraftForm draftId={draftId} />
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
