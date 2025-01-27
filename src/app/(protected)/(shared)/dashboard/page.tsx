import { Banner } from "./_components/banner";
import { Separator } from "@/components/ui/separator";
import ProjectList from "./_components/project-list";
import { api } from "@/trpc/server";
import { SubjectLevel } from "@/db/enums";

export default async function DashboardPage() {
  const projects = await api.projects.getFeaturedProjects();
  const projectCategories = await api.projects.getProjectCategories();
  const competitions = await api.projects.getCompetitions();
  const subjectLevel = Object.keys(SubjectLevel).map((key) => ({
    value: SubjectLevel[key as keyof typeof SubjectLevel],
    label: SubjectLevel[key as keyof typeof SubjectLevel],
  }));

  return (
    <div className="h-screen snap-y snap-mandatory">
      <div className="w-full snap-center">
        <Banner projects={projects} />
      </div>
      <Separator className="mb-6 mt-8" />
      <div className="w-full snap-center">
        <div className="mb-2 space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Featured Projects
          </h1>
          <p className="text-muted-foreground">
            Fun and Exciting Projects for you to play with!
          </p>
        </div>
        <ProjectList
          categoryOptions={projectCategories}
          competitionOptions={competitions}
          subjectOptions={subjectLevel}
        />
      </div>
    </div>
  );
}
