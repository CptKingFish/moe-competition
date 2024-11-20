"use client";

import { RouterOutputs } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface LeaderboardCardProps {
  projects: RouterOutputs["projects"]["getTop10Projects"];
}

export default function LeaderboardCard({ projects }: LeaderboardCardProps) {
  const router = useRouter();

  if (!projects || projects.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No projects available.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card
          key={project.rank as string}
          className="min-w-0 overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg"
          onClick={() => router.push(`/projects/${project.id}`)}
        >
          <CardContent className="relative p-0">
            {["1", "2", "3"].includes(project.rank as string) ? (
              <img
                className="absolute right-4 top-[55%] w-10 sm:right-6 sm:top-6 sm:w-12"
                src={`/${getRankSuffix(project.rank as string)}.png`}
                alt={`${getRankSuffix(project.rank as string)} place`}
              />
            ) : (
              <div className="absolute right-4 top-[55%] flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg font-bold text-black sm:right-6 sm:top-6 sm:h-12 sm:w-12">
                {project.rank as string}
              </div>
            )}
            <span className="absolute bottom-4 right-4 font-semibold sm:bottom-6 sm:right-6">
              {project.totalVotes} votes
            </span>
            <div className="flex flex-col sm:flex-row">
              <div className="h-28 md:h-48 w-full sm:w-1/3">
                <img
                  src={project.bannerImg ?? ""}
                  alt={`${project.name} project image`}
                  className="h-full w-full object-cover"
                />

                {/* Define rank image with appropriate suffix */}
              </div>

              <div className="flex-grow p-4 sm:p-6">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 flex items-center sm:mb-0">
                    <Avatar className="mr-4 h-10 w-10">
                      <AvatarImage
                        src={project.authorAvatar ?? ""}
                        alt={project.author}
                      />
                      <AvatarFallback>
                        {project.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {project.author}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag color="bg-cyan-100 text-cyan-800">
                    {project.category}
                  </Tag>
                  <Tag color="bg-green-100 text-green-800">
                    {project.competition}
                  </Tag>
                  <Tag color={`bg-orange-100 text-orange-800`}>
                    {project.subjectLevel.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
function getRankSuffix(rank: string) {
  switch (rank) {
    case "1":
      return "1st";
    case "2":
      return "2nd";
    case "3":
      return "3rd";
    default:
      return `${rank}th`;
  }
}

const Tag = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <span className={`mr-2 rounded px-2.5 py-0.5 text-xs font-semibold ${color}`}>
    {children}
  </span>
);
