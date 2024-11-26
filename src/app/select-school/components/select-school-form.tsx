"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  Form,
  FormControl,
  FormDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { logoutUser } from "@/lib/session";
import { api, type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SelectSchoolFormSchema = z.object({
  school: z.string({
    required_error: "Please select a school.",
  }),
});

const SelectSchoolForm = ({
  schools,
}: {
  schools: RouterOutputs["school"]["getAllSchoolNames"];
}) => {
  const router = useRouter();
  const [openSchool, setOpenSchool] = useState(false);

  const { mutateAsync: linkUserToSchool } =
    api.school.linkUserToSchool.useMutation();

  const form = useForm<z.infer<typeof SelectSchoolFormSchema>>({
    resolver: zodResolver(SelectSchoolFormSchema),
  });

  const formattedSchools = schools.map((school) => ({
    label: school.name,
    value: school.id,
  }));

  async function onSubmit(data: z.infer<typeof SelectSchoolFormSchema>) {
    const schoolId = data.school;

    try {
      await linkUserToSchool({ schoolId });
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to link user to school. Please try again.");
      console.error(error);
    }
  }
  return (
    <Card className="w-[350px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Select your school</CardTitle>
            <CardDescription>
              You must be linked to a school to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>School</FormLabel>
                  <Popover open={openSchool} onOpenChange={setOpenSchool}>
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
                            ? formattedSchools.find(
                                (school) => school.value === field.value,
                              )?.label
                            : "Select school"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search school..." />
                        <CommandList>
                          <CommandEmpty>No school found.</CommandEmpty>
                          <CommandGroup>
                            {formattedSchools.map((school) => (
                              <CommandItem
                                value={school.value}
                                key={school.value}
                                onSelect={() => {
                                  form.setValue("school", school.value);
                                  setOpenSchool(false);
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => logoutUser()}>
              Log out
            </Button>
            <Button type="submit">Proceed</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SelectSchoolForm;
