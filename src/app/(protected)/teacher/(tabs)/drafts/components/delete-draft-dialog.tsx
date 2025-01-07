"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DeleteDraftDialog = ({ draftId }: { draftId: string }) => {
  const router = useRouter();
  const { mutateAsync: deleteDraft, isPending: isDeletingDraft } =
    api.teacher.deleteProjectDraft.useMutation();

  const deleteDraftHandler = async () => {
    try {
      await deleteDraft(draftId);
      toast.success("Draft deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Error deleting draft.");
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="destructive">
          Delete Draft
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">Delete draft</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this draft submission? The draft
            will be deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              className="w-full"
              variant="destructive"
              disabled={isDeletingDraft}
              onClick={deleteDraftHandler}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDraftDialog;
