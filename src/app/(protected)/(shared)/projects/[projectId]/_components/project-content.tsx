"use client";

import { api, RouterOutputs } from "@/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, PackageX, ThumbsUpIcon, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useRef, useState } from "react";
import RecommendCard from "./recommend-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProjectContentProps {
  project: RouterOutputs["projects"]["getProjectById"];
}

export default function ProjectContent({ project }: ProjectContentProps) {
  const [offSet, setOffSet] = useState(0);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<
    RouterOutputs["projects"]["getProjects"]
  >([]);
  const [hasMore, setHasMore] = useState(true);

  const { refetch, isFetching } = api.projects.getProjects.useQuery(
    {
      excludeId: project.id,
      offSet,
    },
    { enabled: false },
  );

  const { data: userHasVoted, refetch: refetchUserHasVoted } =
    api.projects.checkIfUserVoted.useQuery(project.id);

  const { data: votes, refetch: refetchVotesCount } =
    api.projects.getProjectVotes.useQuery(project.id);

  const { mutateAsync: voteProject, isPending: isVoting } =
    api.projects.voteProject.useMutation();

  const { mutateAsync: unvoteProject, isPending: isUnvoting } =
    api.projects.unvoteProject.useMutation();

  const loadMoreProjects = useCallback(async () => {
    if (isFetching || !hasMore) return;

    const { data } = await refetch();

    if (data && data.length > 0) {
      setProjects((prevProjects) =>
        offSet === 0 ? data : [...prevProjects, ...data],
      );
      setOffSet((prevOffset) => prevOffset + data.length);
    } else {
      setHasMore(false);
    }
  }, [isFetching, hasMore, refetch, offSet]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreProjects();
        }
      },
      { threshold: 0.5 },
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loadMoreProjects]);

  const handleVote = async () => {
    if (isVoting || isUnvoting) return;

    if (!userHasVoted) {
      await voteProject(project.id);
      toast.success("You have voted successfully");
    } else {
      await unvoteProject(project.id);
      toast.success("You have unvoted successfully");
    }
    await refetchUserHasVoted();
    await refetchVotesCount();
  };

  return (
    <>
      <div className="col-span-3">
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <Tabs defaultValue="embed">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="embed">Project</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              <TabsContent value="embed" className="mt-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-4xl">
                    <iframe
                      src={
                        project.projectType === "SCRATCH"
                          ? convertToScratchEmbedUrl(project.projectUrl)
                          : project.projectType === "MICROBIT"
                            ? convertToMakeCodeRunUrl(project.projectUrl)
                            : (project.projectUrl ?? "")
                      }
                      allowFullScreen={true}
                      className="2xl:h-502px] h-[402px] w-full lg:h-[472px]"
                    ></iframe>
                  </div>
                  <span className="my-4 flex items-center border-l-4 border-yellow-500 bg-yellow-100 p-2 text-sm font-medium text-yellow-700">
                    *If content is not displayed properly, refresh the page*
                  </span>
                </div>
              </TabsContent>
              <TabsContent value="video" className="mt-4">
                <div className="aspect-video">
                  {project.youtubeUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={convertToYoutubeEmbed(project.youtubeUrl)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200 text-gray-600">
                      <p>No video available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="mt-8 border-none shadow-none">
          <CardContent className="p-0">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={project.authorAvatar ?? ""}
                      alt="Author"
                    />
                    <AvatarFallback>{project.author}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {project.author}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  variant={`${userHasVoted ? "default" : "outline"}`}
                  onClick={handleVote}
                  disabled={!votes?.isVoteable}
                >
                  {votes?.count ?? 0}
                  <ThumbsUpIcon />
                </Button>
              </div>
            </div>
            {/* Project Description */}
            <div className="mb-10">
              <p className="mb-4 text-gray-600">{project.description}</p>
              <div className="flex flex-wrap">
                <Tag color="bg-cyan-100 text-cyan-800">{project.category}</Tag>
                <Tag color="bg-green-100 text-green-800">
                  {project.competition}
                </Tag>
                <Tag color={`bg-orange-100 text-orange-800`}>
                  {project.subjectLevel.toUpperCase()}
                </Tag>
              </div>
            </div>
            <div className="space-y-4">
              {/* Try it Out! text */}
              <p className="text-2xl font-semibold">Try it Out!</p>

              {/* Conditional rendering for projectUrl */}
              {project.projectUrl && (
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4 text-blue-500" />
                  <a
                    href={project.projectUrl}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.name}
                  </a>
                </div>
              )}

              {/* Separator between projectUrl and youtubeUrl if both exist */}
              {project.projectUrl && project.youtubeUrl && (
                <Separator className="my-2" />
              )}

              {/* Conditional rendering for youtubeUrl */}
              {project.youtubeUrl && (
                <div className="flex items-center space-x-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <a
                    href={project.youtubeUrl}
                    className="text-red-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch on YouTube
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 space-y-4">
        {projects.map((project) => (
          <RecommendCard key={project.id} project={project} />
        ))}
        {isFetching && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-card p-4 shadow-sm">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="mt-4 h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-4 h-10 w-10 rounded-full" />
              </div>
            ))}
          </>
        )}
        {!hasMore && (
          <div className="col-span-full mt-4">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <PackageX className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-xl font-semibold text-foreground">
                No more projects
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;ve reached the end of the list.
              </p>
            </div>
          </div>
        )}
        <div ref={observerRef} className="h-4" />
      </div>
    </>
  );
}

function convertToYoutubeEmbed(url: string) {
  // Regular expression to extract the video ID from both standard and shortened YouTube URLs
  const regex =
    /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/(?:.*[?&]v=)|youtu\.be\/))([A-Za-z0-9_-]{11})/;
  const match = regex.exec(url);

  if (match?.[1]) {
    // Return the formatted embed URL
    return `https://www.youtube.com/embed/${match[1]}`;
  } else {
    return url;
  }
}

function convertToScratchEmbedUrl(url: string) {
  const urlObject = new URL(url);

  // Ensure the URL is a valid Scratch project URL
  if (
    urlObject.hostname === "scratch.mit.edu" &&
    urlObject.pathname.startsWith("/projects/")
  ) {
    return `${urlObject.origin}${urlObject.pathname}/embed`;
  }

  return;
}

function convertToMakeCodeRunUrl(url: string) {
  const urlObject = new URL(url);

  // Ensure the URL is a valid MakeCode project URL
  if (
    urlObject.hostname === "makecode.microbit.org" &&
    urlObject.pathname.startsWith("/_")
  ) {
    const projectId = urlObject.pathname.slice(2); // Extract the ID after "/_"
    return `${urlObject.origin}/#pub:_${projectId}`;
  }

  return;
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
