"use client";

import { Button } from "@/components/ui/button";

import { Plus, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import BulkInsertUsersForm from "./bulk-insert-users-form";
import TemplateCsvDownload from "./template-csv-download";

const BulkInsertUsersDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-2">
          <Users size={20} /> Bulk Insert Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            Bulk Insert Users (for ADMIN and TEACHER users)
          </DialogTitle>
          <DialogDescription>
            Bulk insert user records with a CSV file. WARNING: Your CSV file
            must contain the following rows: name, email, role. The role must be
            either &apos;TEACHER&apos;, or &apos;ADMIN&apos;. If the user email
            already exists in the records, their name and role will be
            overwritten.
          </DialogDescription>
        </DialogHeader>
        <TemplateCsvDownload headers={["name", "email", "role"]} />
        <BulkInsertUsersForm />
      </DialogContent>
    </Dialog>
  );
};

export default BulkInsertUsersDialog;
