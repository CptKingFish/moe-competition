"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

import { Input } from "@/components/ui/input";

import { api, type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
});

const MergeSchoolsForm = () => {
  const router = useRouter();
  const [schools, setSchools] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [openFromSchool, setOpenFromSchool] = useState(false);
  const [openToSchool, setOpenToSchool] = useState(false);

  const {
    data: schoolData,
    isFetched,
    refetch: refetchSchools,
  } = api.school.getAllSchoolNames.useQuery();

  useEffect(() => {
    if (isFetched && schoolData) {
      const formattedSchoolData = schoolData.map((school) => ({
        label: school.name,
        value: school.id,
      }));
      setSchools(formattedSchoolData);
    }
  }, [isFetched, schoolData]);

  const { mutateAsync: mergeSchools, isPending: isMergingSchool } =
    api.admin.mergeSchools.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const mergeData = {
      ...values,
    };

    if (mergeData.fromId === mergeData.toId) {
      toast.error("Cannot merge the same school.");
      return;
    }

    try {
      await mergeSchools(mergeData);

      const fromSchoolName = schools.find(
        (school) => school.value === mergeData.fromId,
      )?.label;

      const toSchoolName = schools.find(
        (school) => school.value === mergeData.toId,
      )?.label;

      toast.success(
        `Schools merged successfully. ${fromSchoolName} has been merged to ${toSchoolName}.`,
      );

      router.refresh();
      await refetchSchools();
    } catch (error) {
      console.error("Error merging schools:", error);
      toast.error("Error merging schools.");
    }
    return;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex w-full flex-col items-center justify-center space-y-2">
          <FormField
            control={form.control}
            name="fromId"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                {/* <FormLabel>Track</FormLabel> */}
                <Popover open={openFromSchool} onOpenChange={setOpenFromSchool}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? schools.find(
                              (school) => school.value === field.value,
                            )?.label
                          : "Select School"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search Track..." />
                      <CommandList>
                        <CommandEmpty>No tracks found.</CommandEmpty>
                        <CommandGroup>
                          {schools.map((school) => {
                            if (school.value === form.getValues().toId)
                              return null;

                            return (
                              <CommandItem
                                value={school.label}
                                key={school.value}
                                onSelect={() => {
                                  form.setValue("fromId", school.value);
                                  setOpenFromSchool(false);
                                }}
                              >
                                {school.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    school.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <span className="font-semibold text-red-400">
              will be merged to
            </span>
          </div>

          <FormField
            control={form.control}
            name="toId"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                {/* <FormLabel>Track</FormLabel> */}
                <Popover open={openToSchool} onOpenChange={setOpenToSchool}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? schools.find(
                              (school) => school.value === field.value,
                            )?.label
                          : "Select School"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search Track..." />
                      <CommandList>
                        <CommandEmpty>No tracks found.</CommandEmpty>
                        <CommandGroup>
                          {schools.map((school) => {
                            if (school.value === form.getValues().fromId)
                              return null;

                            return (
                              <CommandItem
                                value={school.label}
                                key={school.value}
                                onSelect={() => {
                                  form.setValue("toId", school.value);
                                  setOpenToSchool(false);
                                }}
                              >
                                {school.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    school.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              variant="destructive"
              className="w-full"
              type="submit"
              disabled={isMergingSchool}
            >
              Merge
            </Button>
          </div>

          {/* <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              variant="secondary"
              className="w-full"
              type="reset"
              disabled={isMergingSchool}
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </div> */}
        </div>
      </form>
    </Form>
  );
};

export default MergeSchoolsForm;
