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

import AssignSpecialRoleForm from "./assign-special-role-form";

const AssignSpecialRoleDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-2">
          <Plus size={20} /> Assign Special Role
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Assign Special Role</DialogTitle>
          <DialogDescription>
            Assign a user email to a special role (TEACHER / ADMIN). Note that
            unassigned users will have the &apos;STUDENT&apos; role. If the user
            email already exists in the records, their name and role will be
            updated.
          </DialogDescription>
        </DialogHeader>
        <AssignSpecialRoleForm />
      </DialogContent>
    </Dialog>
  );
};

export default AssignSpecialRoleDialog;
