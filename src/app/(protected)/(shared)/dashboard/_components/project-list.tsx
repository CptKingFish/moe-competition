"use client";

import { useState } from "react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

export function ProjectList({
  categoryOptions,
  competitionOptions,
  subjectOptions,
}: ProjectListProps) {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectValue, setSubjectValue] = useState("");

  const [competitionOpen, setCompetitionOpen] = useState(false);
  const [competitionValue, setCompetitionValue] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");

  return (
    <div className="flex justify-end">
      <ScrollArea className="max-w-sm">
        <div className="flex flex-row space-x-4">
          <Button
            variant={"ghost"}
            onClick={() => {
              setSubjectValue("");
              setCompetitionValue("");
              setCategoryValue("");
            }}
            className={`${subjectValue || competitionValue || categoryValue ? "" : "hidden"}`}
          >
            Reset
            <X />
          </Button>
          <DropdownBox
            open={subjectOpen}
            setOpen={setSubjectOpen}
            options={subjectOptions}
            value={subjectValue}
            setValue={setSubjectValue}
            text={"subject"}
          />
          <DropdownBox
            open={competitionOpen}
            setOpen={setCompetitionOpen}
            options={competitionOptions}
            value={competitionValue}
            setValue={setCompetitionValue}
            text={"competition"}
          />
          <DropdownBox
            open={categoryOpen}
            setOpen={setCategoryOpen}
            options={categoryOptions}
            value={categoryValue}
            setValue={setCategoryValue}
            text={"category"}
          />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
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
  value: string;
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
            : `Filter by ${text}`}
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
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
