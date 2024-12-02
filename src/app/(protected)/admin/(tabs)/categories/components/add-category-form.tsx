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

import { Input } from "@/components/ui/input";

import { api, type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(3),
});

const AddCategoryForm = () => {
  const router = useRouter();

  const {
    mutateAsync: createProjectCategory,
    isPending: isCreatingProjectCategory,
  } = api.admin.createProjectCategory.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const categoryData = {
      ...values,
    };

    try {
      await createProjectCategory(categoryData);
      toast.success("Project category added successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error adding project category:", error);
      toast.error("Error adding project category.");
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
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Project Category" {...field} />
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
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              className="w-full"
              type="submit"
              disabled={isCreatingProjectCategory}
            >
              Submit
            </Button>
          </div>

          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              variant="secondary"
              className="w-full"
              type="reset"
              disabled={isCreatingProjectCategory}
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

export default AddCategoryForm;
