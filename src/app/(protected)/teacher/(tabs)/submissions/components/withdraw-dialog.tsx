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

const WithdrawDialog = ({ submissionId }: { submissionId: string }) => {
  const router = useRouter();
  const {
    mutateAsync: withdrawSubmission,
    isPending: isWithdrawingSubmission,
  } = api.teacher.withdrawSubmission.useMutation();

  const withdrawAndSaveAsDraftHandler = async () => {
    try {
      await withdrawSubmission({
        id: submissionId,
        saveAsDraft: true,
      });
      toast.success("Submission withdrawn and saved as draft successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error withdrawing submission:", error);
      toast.error("Error withdrawing submission.");
    }

    return;
  };

  const withdrawAndDeleteHandler = async () => {
    try {
      await withdrawSubmission({
        id: submissionId,
        saveAsDraft: false,
      });
      toast.success("Submission withdrawn and deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error withdrawing submission:", error);
      toast.error("Error withdrawing submission.");
    }

    return;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="destructive">
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-fit sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">
            Withdraw submission
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw your submission? The submission
            will be deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              className="w-full"
              variant="outline"
              disabled={isWithdrawingSubmission}
              onClick={withdrawAndSaveAsDraftHandler}
            >
              Withdraw and Save as Draft
            </Button>
          </div>
          <div className="m-5 w-3/4 max-w-md md:w-1/2">
            <Button
              className="w-full"
              variant="destructive"
              disabled={isWithdrawingSubmission}
              onClick={withdrawAndDeleteHandler}
            >
              Withdraw and Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
