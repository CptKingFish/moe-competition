// BulkInsertUsersForm.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import BulkInsertUsersTable from "./bulk-insert-users-table";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { api } from "@/trpc/react"; // Assuming you're using tRPC for API calls
import { Role } from "@/db/enums";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  // school?: string;
  role: Role;
};

const BulkInsertUsersForm = () => {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsed, setIsParsed] = useState<boolean>(false);

  const { mutateAsync: bulkInsertUsers, isPending: isInsertingUsers } =
    api.admin.bulkInsertUsers.useMutation();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Reset previous errors
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setError("Please upload a valid CSV file.");
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  // Parse CSV file
  const parseCSV = (file: File) => {
    Papa.parse<User>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Validate and map data
        const parsedData: User[] = [];
        for (const row of results.data) {
          // Destructure fields
          const { name, email, role } = row;

          // Basic validation
          if (!name || !email || !role) {
            setError(
              "CSV is missing required fields (name, email, role) in some rows.",
            );
            setUsers([]);
            setIsParsed(false);
            return;
          }

          // check if Role has valid value (ADMIN, TEACHER)
          if (
            role.trim().toUpperCase() !== Role.ADMIN &&
            role.trim().toUpperCase() !== Role.TEACHER
          ) {
            setError(
              `Invalid role value: ${role}. Role must be either 'ADMIN' or 'TEACHER'.`,
            );
            setUsers([]);
            setIsParsed(false);
            return;
          }

          parsedData.push({
            name: name.trim(),
            email: email.trim(),
            // school: school?.trim() ?? undefined, // Handle optional field
            role: role.trim().toUpperCase() as Role,
          });
        }

        setUsers(parsedData);
        setIsParsed(true);
      },
      error: (err) => {
        setError(`Error parsing CSV file: ${err.message}`);
        setIsParsed(false);
      },
    });
  };

  // Handle Bulk Insert
  const onClickBulkInsert = async () => {
    try {
      await bulkInsertUsers(users);
      toast.success("Users has been successfully added.");
      router.refresh();
      onResetClick();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Error assigning role.");
    }
    return;
  };

  // Handle Resubmit
  const onResetClick = () => {
    // Reset the state to allow uploading a new file
    setUsers([]);
    setFile(null);
    setIsParsed(false);
    setError(null);
  };

  return (
    <div className="p-4">
      {!isParsed ? (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="csvFile">CSV file</Label>
          <Input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          {error && <p className="text-red-500">{error}</p>}
        </div>
      ) : (
        <div>
          <BulkInsertUsersTable users={users} />
          {error && <p className="text-red-500">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button onClick={onClickBulkInsert}>Bulk Insert</Button>
            <Button onClick={onResetClick} variant={"secondary"}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkInsertUsersForm;
