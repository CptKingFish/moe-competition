"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { api } from "@/trpc/react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { type ApprovalStatus } from "@/db/enums";
import { useRouter } from "next/navigation";

const ApprovalButtons = ({
  projectId,
  currentApprovalStatus,
}: {
  projectId: string;
  currentApprovalStatus: ApprovalStatus;
}) => {
  const router = useRouter();
  const { mutateAsync: updateProjectApprovalStatus } =
    api.admin.updateProjectApprovalStatus.useMutation();

  const onClickApprovalButton = async (
    newApprovalStatus: "APPROVED" | "REJECTED",
  ) => {
    try {
      await updateProjectApprovalStatus({
        projectId,
        approvalStatus: newApprovalStatus,
      });
      toast.success(`Project ${newApprovalStatus.toLowerCase()} successfully!`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update project approval status");
    }
  };
  if (currentApprovalStatus === "PENDING") {
    return (
      <div className="flex justify-evenly">
        <Button
          variant="default"
          size="icon"
          onClick={() => onClickApprovalButton("APPROVED")}
        >
          <Check />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onClickApprovalButton("REJECTED")}
        >
          <X />
        </Button>
      </div>
    );
  } else if (currentApprovalStatus === "APPROVED") {
    return (
      <div className="flex justify-center">
        <Badge variant="default">Approved</Badge>
      </div>
    );
  } else if (currentApprovalStatus === "REJECTED") {
    return (
      <div className="flex justify-center">
        <Badge variant="destructive">Rejected</Badge>
      </div>
    );
  }
};

export default ApprovalButtons;
