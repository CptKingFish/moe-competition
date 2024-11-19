"use client";

import { RouterOutputs } from "@/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProjectContentProps {
  project: RouterOutputs["projects"]["getProjectById"];
}

export default function ProjectContent({ project }: ProjectContentProps) {
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
                      src="https://scratch.mit.edu/projects/628351249/embed"
                      frameBorder="0"
                      allowFullScreen={true}
                      className="h-[402px] w-full md:h-[502px] lg:h-[602px]"
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
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={project.authorAvatar ?? ""} alt="Author" />
                  <AvatarFallback>{project.author}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">
                    {project.author}
                  </p>
                </div>
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

      <div className="col-span-1">test</div>
      {/* <Card className="col-span-1 border-none shadow-none">
        <CardHeader className="mb-6 p-0">
          <CardTitle>Author</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="Author" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">John Doe</p>
              <p className="text-sm text-muted-foreground">Project Creator</p>
            </div>
          </div>
        </CardContent>
      </Card> */}
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
