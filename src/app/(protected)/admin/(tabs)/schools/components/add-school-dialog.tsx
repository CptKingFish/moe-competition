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

import AddSchoolForm from "./add-school-form";

const AddSchoolDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-2">
          <Plus size={20} /> Add School
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Add School</DialogTitle>
          <DialogDescription>
            Add a new school. Short name will be used to automatically detect
            associated school from student Google name.
          </DialogDescription>
        </DialogHeader>
        <AddSchoolForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddSchoolDialog;
