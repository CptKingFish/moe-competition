import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/server";
import { ThumbsUp } from "lucide-react";
import ProjectContent from "./_components/project-content";

interface pageProps {
  params: {
    projectId: string;
  };
}

const page = async ({ params }: pageProps) => {
  const project = await api.projects.getProjectById(params.projectId);

  return (
    <div>
      <div className="mb-4 flex flex-col items-start justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold">{project.name}</h1>
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{project.totalVotes} votes</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <ProjectContent project={project} />
      </div>
    </div>
  );
};

export default page;
