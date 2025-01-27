"use client";

import { useCallback, useEffect, useState } from "react";
import Podium from "./podium";
import { Separator } from "@/components/ui/separator";
import LeaderboardCard from "./leaderboard-card";
import { api, RouterOutputs } from "@/trpc/react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { SubjectLevel } from "@/db/enums";
import { set } from "date-fns";

interface LeaderBoardProps {
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

const LeaderBoard = ({
  subjectOptions,
  competitionOptions,
  categoryOptions,
}: LeaderBoardProps) => {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectValue, setSubjectValue] = useState<string | null>(null);

  const [competitionOpen, setCompetitionOpen] = useState(false);
  const [competitionValue, setCompetitionValue] = useState<string | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [projects, setProjects] = useState<
    RouterOutputs["projects"]["getTop10Projects"]
  >([]);

  const { refetch, isFetching } = api.projects.getTop10Projects.useQuery(
    {
      subject: subjectValue as SubjectLevel,
      competition: competitionValue,
      category: categoryValue,
    },
    { enabled: false },
  );

  const loadMoreProjects = useCallback(async () => {
    const { data } = await refetch();
    setProjects(data ?? []);
  }, [isFetching, refetch]);

  useEffect(() => {
    setProjects([]);
    void loadMoreProjects();
  }, [subjectValue, competitionValue, categoryValue]);

  return (
    <div>
      <Podium projects={projects.slice(0, 3)} />
      <Separator className="mb-6 mt-8" />
      <h1 className="mb-3 text-2xl font-bold tracking-tight">
        The Top 10 Projects
      </h1>
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
      <LeaderboardCard projects={projects} />
    </div>
  );
};

export default LeaderBoard;
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
