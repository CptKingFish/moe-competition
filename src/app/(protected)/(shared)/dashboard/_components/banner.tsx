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

export function Banner() {
  return (
    <Carousel
      className="relative w-full items-start"
      opts={{
        loop: true,
      }}
    >
      <CarouselPrevious className="left-10 z-10" />
      <CarouselNext className="right-10 z-10" />
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="p-0">
                  <div className="relative flex flex-col md:flex-row">
                    <div className="aspect-video max-h-48 w-2/3">
                      <img
                        src={"https://cdn2.scratch.mit.edu/get_image/project/860625507_480x360.png"}
                        alt={"Icon.svg"}
                        className="w-10/12 rounded-t-lg object-cover md:rounded-l-lg md:rounded-tr-none"
                      />
                      <div className="absolute inset-0 bottom-1/2 left-0 right-0 rounded-t-lg bg-gradient-to-t from-black/60 to-transparent md:bottom-0 md:right-1/3 md:rounded-l-lg md:rounded-tr-none" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="mb-2 text-2xl font-bold text-white">
                          test
                        </h2>
                        <Badge variant="secondary" className="text-sm">
                          test
                        </Badge>
                      </div>
                    </div>
                    <div className="flex w-full flex-col justify-between rounded-b-lg bg-white p-6 md:w-1/3 md:rounded-r-lg">
                      <div>
                        <div className="mb-4 flex items-center">
                          <Avatar className="mr-3 h-10 w-10">
                            <AvatarImage src={"Icon.svg"} alt={"Icon.svg"} />
                            <AvatarFallback>test</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">test</p>
                            <p className="text-xs text-muted-foreground">
                              Project Creator
                            </p>
                          </div>
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">
                          An innovative project pushing the boundaries of
                          technology and creativity.
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">9 Likes</span>
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
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
