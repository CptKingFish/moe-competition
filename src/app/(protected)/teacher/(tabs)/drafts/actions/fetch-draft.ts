"use server";

import { api } from "@/trpc/server";

export async function fetchBannerImgByDraftId(draftId: string) {
  // Fetch submission by ID
  const draft = await api.teacher.getBannerImgByDraftId(draftId);
  return draft;
}
