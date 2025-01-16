"use client";

import { Button } from "@/components/ui/button";

import { Pencil, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import EditCompetitionForm from "./edit-competition-form";

const EditCompetitionDialog = ({
  competitionId,
}: {
  competitionId: string;
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
          <DialogTitle>Edit Competition</DialogTitle>
          <DialogDescription>
            Edit competition details. Click update when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <EditCompetitionForm competitionId={competitionId} />
      </DialogContent>
    </Dialog>
  );
};

export default EditCompetitionDialog;
