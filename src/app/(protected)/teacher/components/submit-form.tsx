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

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { ProjectType, SubjectLevel } from "@/db/enums";
import { useState } from "react";
import ImageUpload from "./image-upload";
import { api, RouterOutputs } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  competitionId: z.string(),
  projectTitle: z.string().min(3, {
    message: "Project title should be at least 3 characters long.",
  }),
  projectCategoryId: z.string(),
  track: z.nativeEnum(SubjectLevel, {
    required_error: "Please select a track.",
  }),
  projectType: z.nativeEnum(ProjectType, {
    required_error: "Please select a project type.",
  }),
  projectUrl: z.string().url("Please provide a valid URL."),
  studentName: z.string().min(3, {
    message: "Student name should be at least 3 characters long.",
  }),
  studentEmail: z.string().email("Please provide a valid email."),
  youtubeUrl: z.string().url("Please provide a valid URL.").optional(),
  description: z.string().optional(),
  bannerImg: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size is 5MB.")
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Banner image can only be uploaded in JPEG or PNG format.",
    )
    .optional(),
});

const tracks = Object.values(SubjectLevel).map((track) => ({
  label: track,
  value: track,
}));

const projectTypes = Object.values(ProjectType).map((projectType) => ({
  label: projectType,
  value: projectType,
}));

const SubmitForm = ({
  projectCategories,
  competitions,
}: {
  projectCategories: RouterOutputs["projects"]["getProjectCategories"];
  competitions: RouterOutputs["projects"]["getCompetitions"];
}) => {
  const [openTrack, setOpenTrack] = useState(false);
  const [openProjectType, setOpenProjectType] = useState(false);
  const [openProjectCategory, setOpenProjectCategory] = useState(false);
  const [openCompetition, setOpenCompetition] = useState(false);

  const { mutate: submitProject } = api.teacher.submitProject.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      competitionId: undefined,
      projectTitle: "",
      projectCategoryId: undefined,
      track: "G1",
      projectType: "SCRATCH",
      projectUrl: "",
      studentName: "",
      studentEmail: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    if (!values.bannerImg) {
      const inputData = {
        ...values,
        bannerImg: undefined,
      };
      submitProject(inputData);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(values.bannerImg); // Read file as Data URL (base64)

    reader.onloadend = () => {
      const base64data = reader.result as string;

      const inputData = {
        ...values,
        bannerImg: base64data,
      };

      console.log(inputData);

      submitProject(inputData);
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex h-screen">
          <div className="m-5 w-1/2 space-y-8">
            {/* <span className="font-semibold">Project Information</span> */}
            <FormField
              control={form.control}
              name="competitionId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Competition</FormLabel>
                  <Popover
                    open={openCompetition}
                    onOpenChange={setOpenCompetition}
                  >
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
                            ? competitions.find(
                                (competition) =>
                                  competition.value === field.value,
                              )?.label
                            : "Select Competition"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search Competition..." />
                        <CommandList>
                          <CommandEmpty>No competitions found.</CommandEmpty>
                          <CommandGroup>
                            {competitions.map((competition) => (
                              <CommandItem
                                value={competition.label}
                                key={competition.value}
                                onSelect={() => {
                                  form.setValue(
                                    "competitionId",
                                    competition.value,
                                  );
                                  setOpenCompetition(false);
                                }}
                              >
                                {competition.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    competition.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
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
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
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
              name="projectCategoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Project Category</FormLabel>
                  <Popover
                    open={openProjectCategory}
                    onOpenChange={setOpenProjectCategory}
                  >
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
                            ? projectCategories.find(
                                (category) => category.value === field.value,
                              )?.label
                            : "Select Category"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search Category..." />
                        <CommandList>
                          <CommandEmpty>No categories found.</CommandEmpty>
                          <CommandGroup>
                            {projectCategories.map((category) => (
                              <CommandItem
                                value={category.label}
                                key={category.value}
                                onSelect={() => {
                                  form.setValue(
                                    "projectCategoryId",
                                    category.value,
                                  );
                                  setOpenProjectCategory(false);
                                }}
                              >
                                {category.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    category.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
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
            <FormField
              control={form.control}
              name="track"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Track</FormLabel>
                  <Popover open={openTrack} onOpenChange={setOpenTrack}>
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
                            ? tracks.find(
                                (track) => track.value === field.value,
                              )?.label
                            : "Select Track"}
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
                            {tracks.map((track) => (
                              <CommandItem
                                value={track.label}
                                key={track.value}
                                onSelect={() => {
                                  form.setValue("track", track.value);
                                  setOpenTrack(false);
                                }}
                              >
                                {track.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    track.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
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
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Project Type</FormLabel>
                  <Popover
                    open={openProjectType}
                    onOpenChange={setOpenProjectType}
                  >
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
                            ? projectTypes.find(
                                (projectType) =>
                                  projectType.value === field.value,
                              )?.label
                            : "Select Project Type"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search Project Type..." />
                        <CommandList>
                          <CommandEmpty>No project types found.</CommandEmpty>
                          <CommandGroup>
                            {projectTypes.map((projectType) => (
                              <CommandItem
                                value={projectType.label}
                                key={projectType.value}
                                onSelect={() => {
                                  form.setValue(
                                    "projectType",
                                    projectType.value,
                                  );
                                  setOpenProjectType(false);
                                }}
                              >
                                {projectType.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    projectType.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
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
            <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="URL" {...field} />
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
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
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
              name="studentEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </div>
          <div className="m-5 w-1/2 space-y-8">
            <Controller
              control={form.control}
              name="bannerImg"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldState.error ? "text-red-500" : ""}>
                    Upload Banner Image
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      onBlur={field.onBlur}
                      error={fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <ImageUpload /> */}
            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Youtube URL</FormLabel>
                  <FormControl>
                    <Input placeholder="URL" {...field} />
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
                  <FormLabel>Project Description</FormLabel>
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
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SubmitForm;
