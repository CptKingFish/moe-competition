import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RouterOutputs } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface RecommendCardProps {
  project: RouterOutputs["projects"]["getProjects"][0];
}

export default function RecommendCard({ project }: RecommendCardProps) {
  const router = useRouter();

  return (
    <Card
      className="min-w-0 overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg lg:max-h-[200px] lg:max-w-[300px]"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardContent className="relative p-0">
        <div className="flex flex-col sm:flex-row lg:flex-col">
          <div className="h-28 md:h-32 lg:h-16 w-full sm:w-1/3 lg:w-full">
            <img
              src={project.bannerImg ?? ""}
              alt={`${project.name} project image`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-grow p-4 sm:p-3 lg:p-3">
            <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between lg:mb-1">
              <div className="flex items-center">
                <Avatar className="mr-2 h-8 w-8 lg:h-6 lg:w-6">
                  <AvatarImage
                    src={project.authorAvatar ?? ""}
                    alt={project.author}
                  />
                  <AvatarFallback>{project.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-semibold lg:text-sm">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground lg:text-[10px]">
                    by {project.author}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-row flex-wrap justify-between space-y-2">
              <div className="mt-2 flex flex-wrap gap-1 lg:gap-0.5">
                <Tag color="bg-cyan-100 text-cyan-800">{project.category}</Tag>
                <Tag color="bg-green-100 text-green-800">
                  {project.competition}
                </Tag>
                <Tag color={`bg-orange-100 text-orange-800`}>
                  {project.subjectLevel.toUpperCase()}
                </Tag>
              </div>
              <span className="self-end text-sm font-semibold lg:text-xs">
                {project.totalVotes} votes
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Tag = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <span
    className={`mr-1 rounded px-2 py-0.5 text-xs font-semibold lg:mr-0.5 lg:px-1.5 lg:py-0.5 lg:text-[10px] ${color}`}
  >
    {children}
  </span>
);
