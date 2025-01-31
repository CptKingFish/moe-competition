import React from "react";
import { api } from "@/trpc/server";
import { SubjectLevel } from "@/db/enums";
import LeaderBoard from "./_components/LeaderBoard";

const page = async () => {
  // const projects = await api.projects.getTop10Projects();
  const projectCategories = await api.projects.getProjectCategories();
  const competitions = await api.projects.getCompetitions();
  const subjectLevel = Object.keys(SubjectLevel).map((key) => ({
    value: SubjectLevel[key as keyof typeof SubjectLevel],
    label: SubjectLevel[key as keyof typeof SubjectLevel],
  }));
  return (
    <LeaderBoard
      subjectOptions={subjectLevel}
      competitionOptions={competitions}
      categoryOptions={projectCategories}
    />
  );
};

export default page;
