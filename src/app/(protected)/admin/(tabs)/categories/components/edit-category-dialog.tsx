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

import EditCategoryForm from "./edit-category-form";

const EditCategoryDialog = ({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
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
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make updates to the category here. Click update when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <EditCategoryForm categoryId={categoryId} categoryName={categoryName} />
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
