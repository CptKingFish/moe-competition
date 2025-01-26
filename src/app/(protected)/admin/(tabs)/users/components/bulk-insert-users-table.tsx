// UsersTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UsersTableProps {
  users: {
    name: string;
    email: string;
    // school?: string;
    role: string;
  }[];
}

const BulkInsertUsersTable: React.FC<UsersTableProps> = ({ users }) => {
  return (
    <Table>
      <TableCaption>Preview of users to be inserted.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          {/* <TableHead>School</TableHead> */}
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, index) => (
          <TableRow key={index}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            {/* <TableCell>{user.school ?? "-"}</TableCell> */}
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BulkInsertUsersTable;
