import React from "react";
import Podium from "./_components/podium";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";
import LeaderboardCard from "./_components/leaderboard-card";

const page = async () => {
  const projects = await api.projects.getTop10Projects();

  return (
    <div>
      <Podium projects={projects.slice(0, 3)} />
      <Separator className="mb-6 mt-8" />
      <h1 className="mb-3 text-2xl font-bold tracking-tight">
        The Top 10 Projects
      </h1>
      <LeaderboardCard projects={projects} />
    </div>
  );
};

export default page;
