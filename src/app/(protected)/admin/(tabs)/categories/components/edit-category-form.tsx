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

const EditCategoryForm = ({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) => {
  const router = useRouter();

  const { mutateAsync: editCategory, isPending: isEditingCategory } =
    api.admin.editCategory.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: categoryName,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const categoryData = {
      categoryId,
      categoryName: values.name,
    };

    try {
      await editCategory(categoryData);
      toast.success("Category updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category.");
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
                    <Input placeholder="Category" {...field} />
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
              disabled={isEditingCategory}
            >
              Update
            </Button>
          </div>

          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              variant="secondary"
              className="w-full"
              type="reset"
              disabled={isEditingCategory}
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

export default EditCategoryForm;
