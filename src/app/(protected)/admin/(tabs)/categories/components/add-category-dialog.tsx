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

import AddCategoryForm from "./add-category-form";

const AddCategoryDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-2">
          <Plus size={20} /> New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Add Project Category</DialogTitle>
          <DialogDescription>Add a new project category.</DialogDescription>
        </DialogHeader>
        <AddCategoryForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
