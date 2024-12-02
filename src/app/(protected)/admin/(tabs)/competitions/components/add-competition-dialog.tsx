"use client";

import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import AddCompetitionForm from "./add-competition-form";

const AddCompetitionDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-2">
          <Plus size={20} /> New competition
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Add Competition</DialogTitle>
          <DialogDescription>Add a new competition.</DialogDescription>
        </DialogHeader>
        <AddCompetitionForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddCompetitionDialog;
