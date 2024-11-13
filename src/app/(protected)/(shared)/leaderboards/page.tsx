import React from "react";
import Podium from "./_components/podium";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

const page = async () => {

  const projects = await api.projects.getTop10Projects();

  console.log(projects.length);
  console.log(projects);

  return (
    <div>
      <Podium projects={projects.slice(0,3)}/>
      <Separator className="mb-6 mt-8" />
      <h1 className="text-2xl font-bold tracking-tight">The Top 10 Projects</h1>
    </div>
  );
};

export default page;
