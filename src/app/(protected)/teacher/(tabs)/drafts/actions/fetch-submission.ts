"use server";

import { api } from "@/trpc/server";

export async function fetchBannerImgByProjectId(submissionId: string) {
  // Fetch submission by ID
  const submission = await api.teacher.getBannerImgByProjectId(submissionId);
  return submission;
}
