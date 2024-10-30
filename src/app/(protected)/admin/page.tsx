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

// Mock user data
const users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Editor",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "David Lee",
    email: "david@example.com",
    role: "User",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Eva Martinez",
    email: "eva@example.com",
    role: "Admin",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const AdminPanelPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mb-4">
            <DataTable data={filteredUsers} />
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
