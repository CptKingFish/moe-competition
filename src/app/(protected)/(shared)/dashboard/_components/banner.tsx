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
      className="mx-auto max-w-sm md:max-w-md lg:max-w-full"
      opts={{
        loop: true,
      }}
    >
      <CarouselPrevious className="left-10 z-10" />
      <CarouselNext className="right-10 z-10" />
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div>
              <Card>
                <CardContent className="h-ful relative flex flex-col p-0 md:h-48 md:flex-row">
                  <div className="h-2/3 basis-2/3 md:h-full">
                    <img
                      className="h-full w-full rounded-t-xl object-cover md:rounded-s-xl md:rounded-e-none"
                      src="https://via.placeholder.com/640x360"
                      alt="banner"
                    />
                  </div>
                  <div className="flex w-full basis-1/3 flex-col justify-between space-y-4 p-4">
                    <div>
                      <h3 className="font-semibold">
                        Project Title {index + 1}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        This is a brief description of the project. It showcases
                        the main features and goals.
                      </p>
                    </div>
                    <div>
                      <div className="flex space-x-1">
                        <Badge variant="secondary" className="text-xs">
                          Tag 1
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Tag 2
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://i.pravatar.cc/150?u=${index}`}
                            alt="Author"
                          />
                          <AvatarFallback>AU</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                          by Author Name
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
