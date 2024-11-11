"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, PackageX, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ProjectCard from "./project-card";
import { api, RouterOutputs } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectLevel } from "@/db/enums";

interface ProjectListProps {
  subjectOptions: {
    value: string;
    label: string;
  }[];
  competitionOptions: {
    value: string;
    label: string;
  }[];
  categoryOptions: {
    value: string;
    label: string;
  }[];
}

export default function ProjectList({
  categoryOptions,
  competitionOptions,
  subjectOptions,
}: ProjectListProps) {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectValue, setSubjectValue] = useState<string | null>(null);

  const [competitionOpen, setCompetitionOpen] = useState(false);
  const [competitionValue, setCompetitionValue] = useState<string | null>(
    competitionOptions.find((option) => option.label === "2024")?.value ?? null,
  );

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);

  const [offSet, setOffSet] = useState(0);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<
    RouterOutputs["projects"]["getProjects"]
  >([]);
  const [hasMore, setHasMore] = useState(true);

  const { refetch, isFetching } = api.projects.getProjects.useQuery(
    {
      subject: subjectValue as SubjectLevel,
      competition: competitionValue,
      category: categoryValue,
      offSet,
    },
    { enabled: false },
  );

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

  useEffect(() => {
    setOffSet(0);
    setProjects([]);
    setHasMore(true);
    void loadMoreProjects();
  }, [subjectValue, competitionValue, categoryValue]);

  return (
    <div>
      <div className="flex justify-start lg:justify-end">
        <ScrollArea className="mb-3 max-w-[calc(100vw-3.5rem)] pb-4 md:max-w-[calc(100vw-19rem)] lg:max-w-fit">
          <div className="flex flex-row space-x-4">
            {(subjectValue ?? competitionValue ?? categoryValue) && (
              <Button
                variant={"ghost"}
                onClick={() => {
                  setSubjectValue(null);
                  setCompetitionValue(null);
                  setCategoryValue(null);
                }}
              >
                Reset
                <X />
              </Button>
            )}
            <DropdownBox
              open={subjectOpen}
              setOpen={setSubjectOpen}
              options={subjectOptions}
              value={subjectValue}
              setValue={setSubjectValue}
              text={"levels"}
            />
            <DropdownBox
              open={competitionOpen}
              setOpen={setCompetitionOpen}
              options={competitionOptions}
              value={competitionValue}
              setValue={setCompetitionValue}
              text={"competitions"}
            />
            <DropdownBox
              open={categoryOpen}
              setOpen={setCategoryOpen}
              options={categoryOptions}
              value={categoryValue}
              setValue={setCategoryValue}
              text={"categories"}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.name}
            author={project.author}
            authorAvatar={project.authorAvatar ?? ""}
            projectUrl={project.projectUrl}
            votes={project.totalVotes}
            category={project.category ?? ""}
            competition={project.competition ?? ""}
            subjectLevel={project.subjectLevel}
          />
        ))}
        {isFetching && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-card p-4 shadow-sm">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="mt-4 h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-4 h-10 w-10 rounded-full" />
              </div>
            ))}
          </>
        )}
      </div>
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
  );
}

interface DropdownBoxProps {
  options: {
    value: string;
    label: string;
  }[];
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string | null;
  setValue: (value: string) => void;
  text: string;
}

function DropdownBox({
  options,
  open,
  setOpen,
  value,
  setValue,
  text,
}: DropdownBoxProps) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value
            ? options.find((framework) => framework.value === value)?.label
            : `All ${text}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search`} />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {options.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.label}
                  onSelect={(currentValue) => {
                    const value = options.find(
                      (option) => option.label === currentValue,
                    )?.value;
                    setValue(value ?? "");
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
