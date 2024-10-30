"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import DataTable from "./components/data-table";
import { columns } from "./components/columns";
import { User } from "@/db/types";

// Mock user data
const users: (User & { school: string })[] = [];

const AdminPanelPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="container mx-auto">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mb-4">
            <DataTable columns={columns} data={users} pageCount={0} />
          </div>
        </TabsContent>
        <TabsContent value="projects">
          <p>Projects content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
