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
import Image from "next/image";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { ProjectType, SubjectLevel } from "@/db/enums";
import { useEffect, useState } from "react";
import ImageUpload from "@/app/(protected)/teacher/components/image-upload";
import { api, type RouterOutputs } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fetchBannerImgByProjectId } from "../actions/fetch-submission";
import { useRouter } from "next/navigation";
import WithdrawDialog from "./withdraw-dialog";

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

const UpdateSubmissionForm = ({ submissionId }: { submissionId: string }) => {
  const router = useRouter();

  const [openTrack, setOpenTrack] = useState(false);
  const [openProjectType, setOpenProjectType] = useState(false);
  const [openProjectCategory, setOpenProjectCategory] = useState(false);
  const [openCompetition, setOpenCompetition] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(
    undefined,
  );

  const { data: projectCategories } =
    api.projects.getProjectCategories.useQuery();
  const { data: competitions } = api.projects.getCompetitions.useQuery({
    onlyOngoing: true,
  });

  const {
    data: submission,
    isSuccess: projectFetched,
    refetch: refetchProject,
  } = api.teacher.getProjectById.useQuery(submissionId);

  const { mutateAsync: updateProject, isPending: isUpdatingProject } =
    api.teacher.updateProject.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      competitionId: undefined,
      projectTitle: undefined,
      projectCategoryId: undefined,
      track: undefined,
      projectType: undefined,
      projectUrl: undefined,
      studentName: undefined,
      studentEmail: undefined,
      description: undefined,
      youtubeUrl: undefined,
    },
  });

  useEffect(() => {
    if (projectFetched) {
      const formattedSubmission = {
        competitionId: submission.competitionId ?? undefined,
        projectTitle: submission.name,
        projectCategoryId: submission.projectCategoryId ?? undefined,
        track: submission.subjectLevel,
        projectType: submission.projectType,
        projectUrl: submission.projectUrl,
        studentName: submission.author,
        studentEmail: submission.authorEmail,
        youtubeUrl: submission.youtubeUrl ?? undefined,
        description: submission.description ?? undefined,
        bannerImg: undefined,
      };

      form.reset(formattedSubmission);

      void fetchBannerImgByProjectId(submissionId).then((project) => {
        if (project.imageSrc) {
          setUploadedImageUrl(project.imageSrc);
        }
      });
    }
  }, [form, projectFetched, submission, submissionId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.bannerImg) {
      const updateData = {
        projectId: submissionId,
        ...values,
        bannerImg: undefined,
      };

      try {
        await updateProject(updateData);
        toast.success("Project submitted successfully.");
        router.refresh();
        await refetchProject();
      } catch (error) {
        console.error("Error submitting project:", error);
        toast.error("Error submitting project.");
      }
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(values.bannerImg); // Read file as Data URL (base64)

    reader.onloadend = async () => {
      const base64data = reader.result as string;

      const updateData = {
        projectId: submissionId,
        ...values,
        bannerImg: base64data,
      };

      try {
        await updateProject(updateData);
        toast.success("Project submitted successfully.");
        form.reset();
        router.refresh();
      } catch (error) {
        console.error("Error submitting project:", error);
        toast.error("Error submitting project.");
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Error reading file.");
    };
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center justify-center md:flex-row md:items-start">
          <div className="w-full max-w-md space-y-8 md:m-5 md:w-1/2">
            <span className="font-semibold">Project Information</span>{" "}
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
                            ? competitions?.find(
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
                            {competitions?.map((competition) => (
                              <CommandItem
                                value={competition.label}
                                key={competition.value}
                                onSelect={() => {
                                  form.setValue(
                                    "competitionId",
                                    competition.value,
                                  );
                                  setOpenCompetition(false);
                                  // @ts-expect-error - resetting the project category field when competition changes
                                  form.setValue("projectCategoryId", undefined);
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
                            ? projectCategories?.find(
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
                          <CommandEmpty>
                            {form.getValues("competitionId")
                              ? "No categories found."
                              : "Please select a competition."}
                          </CommandEmpty>
                          <CommandGroup>
                            {projectCategories?.map((category) => {
                              const selectedCompetitionId =
                                form.getValues("competitionId");

                              if (!competitions) return null;

                              const selectedCompetition = competitions.find(
                                (competition) =>
                                  competition.value === selectedCompetitionId,
                              );

                              const allowedCategories =
                                selectedCompetition?.categories ?? [];

                              if (!allowedCategories.includes(category.value)) {
                                return null;
                              }
                              return (
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
            {/* <Button className="w-full" type="submit">
              Submit
            </Button> */}
          </div>
          <div className="w-full max-w-md space-y-8 md:m-5 md:w-1/2">
            {uploadedImageUrl && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">
                  Previously uploaded image:
                </p>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={uploadedImageUrl}
                    alt="Preview"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            )}
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
            <div className="m-2"></div>
            <span className="font-semibold">Student Information</span>
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
            <FormField
              control={form.control}
              name="track"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Level</FormLabel>
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
                            : "Select Level"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search Level..." />
                        <CommandList>
                          <CommandEmpty>No levels found.</CommandEmpty>
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
          </div>
        </div>
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              className="w-full"
              type="submit"
              disabled={isUpdatingProject}
            >
              Submit
            </Button>
          </div>

          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <WithdrawDialog submissionId={submissionId} />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default UpdateSubmissionForm;
