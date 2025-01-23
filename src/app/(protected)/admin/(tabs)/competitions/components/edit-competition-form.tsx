"use client";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { api, type RouterOutputs } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useMemo } from "react";
import { MultiSelect } from "@/components/multi-select";

const formSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  categoryIds: z
    .array(z.string())
    .min(1, { message: "Select at least one category." }),
});

const EditCompetitionForm = ({ competitionId }: { competitionId: string }) => {
  const router = useRouter();

  const { data: categories } = api.admin.getProjectCategories.useQuery({});

  const categoriesList = useMemo(() => {
    if (!categories) {
      return [];
    }

    return categories.data.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }, [categories]);

  const {
    data: competitionData,
    refetch: refetchCompetitionData,
    isFetched: isCompetitionFetched,
  } = api.admin.getCompetitionById.useQuery(competitionId);

  const { mutateAsync: editCompetition, isPending: isEditingCompetition } =
    api.admin.editCompetition.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (isCompetitionFetched && competitionData) {
      const formattedCompetition = {
        name: competitionData.name,
        description: competitionData.description,
        startDate: competitionData.startDate,
        endDate: competitionData.endDate,
        categoryIds: competitionData.categoryIds,
      };

      form.reset(formattedCompetition);
    }
  }, [competitionData, form, isCompetitionFetched]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const competitionData = {
      id: competitionId,
      ...values,
    };

    // check if end date is after start date
    if (competitionData.endDate < competitionData.startDate) {
      form.setError("endDate", {
        type: "manual",
        message: "End date must be after start date.",
      });
      return;
    }

    try {
      await editCompetition(competitionData);
      toast.success("Competition updated successfully.");
      router.refresh();
      await refetchCompetitionData();
    } catch (error) {
      console.error("Error updating competition:", error);
      toast.error("Error updating competition.");
    }
    return;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center justify-center md:flex-row md:items-start">
          <div className="w-full space-y-8 py-5 md:m-5">
            {/* <span className="font-semibold">Project Information</span> */}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competition Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Competition" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between space-x-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex w-1/2 flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              field.value.toDateString()
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex w-1/2 flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              field.value.toDateString()
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categoriesList}
                      value={field.value} // Controlled value
                      onValueChange={field.onChange} // Controlled onChange
                      placeholder="Categories"
                      variant="inverted"
                      // animation={2}
                      maxCount={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              className="w-full"
              type="submit"
              disabled={isEditingCompetition}
            >
              Update
            </Button>
          </div>

          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              variant="secondary"
              className="w-full"
              type="reset"
              disabled={isEditingCompetition}
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EditCompetitionForm;
