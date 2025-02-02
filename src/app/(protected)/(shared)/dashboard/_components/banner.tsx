"use client";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RouterOutputs } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface BannerProps {
  projects: RouterOutputs["projects"]["getFeaturedProjects"];
}

export function Banner({ projects }: BannerProps) {
  const router = useRouter();

  return (
    <Carousel
      // className="mx-auto max-w-sm md:max-w-md lg:max-w-full"
      className="mx-auto max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-18rem)] 2xl:max-w-full"
      opts={{
        loop: true,
      }}
    >
      <CarouselPrevious className="left-10 z-10" />
      <CarouselNext className="right-10 z-10" />
      <CarouselContent>
        {projects.map((project, index) => (
          <CarouselItem key={index}>
            <div>
              <Card>
                <CardContent
                  className="h-ful relative flex flex-col p-0 hover:cursor-pointer md:h-48 md:flex-row"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="h-2/3 basis-2/3 md:h-full">
                    <img
                      className="h-full w-full rounded-t-xl object-cover md:rounded-e-none md:rounded-s-xl"
                      alt="banner"
                      src={project.bannerImg ?? ""}
                    />
                  </div>
                  <div className="flex w-full basis-1/3 flex-col justify-between space-y-4 p-4">
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {project.description}
                      </p>
                    </div>
                    <div>
                      <div className="flex space-x-1">
                        <span className="mr-2 rounded bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
                          {project.category}
                        </span>
                        <span className="mr-2 rounded bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                          {project.subjectLevel}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`${project.authorAvatar}`}
                            alt="Author"
                          />
                          <AvatarFallback>{project.author}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                          by {project.author}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
