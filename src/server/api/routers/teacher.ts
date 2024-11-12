import { z } from "zod";

import { teacherProcedure, createTRPCRouter } from "@/server/api/trpc";
import { db } from "@/database";
import { ProjectType, Role, SubjectLevel } from "@/db/enums";
import { TRPCError } from "@trpc/server";
import { getCurrentSession } from "@/lib/session";
import { createId } from "@paralleldrive/cuid2";

export const teacherRouter = createTRPCRouter({
  submitProject: teacherProcedure
    .input(
      z.object({
        projectTitle: z.string().min(3),
        track: z.nativeEnum(SubjectLevel),
        projectType: z.nativeEnum(ProjectType),
        projectUrl: z.string().url(),
        studentName: z.string().min(3),
        studentEmail: z.string().email(),
        youtubeUrl: z.string().url().optional(),
        description: z.string().optional(),
        bannerImg: z.string().optional(),
        competitionId: z.string(),
        projectCategoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let imageBuffer: Buffer | null = null;
      if (input.bannerImg) {
        const parts = input.bannerImg.split(",");
        if (parts.length > 1 && parts[1]) {
          imageBuffer = Buffer.from(parts[1], "base64");
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid base64 image",
          });
        }
      }

      // Retrieve the user ID from the session
      const { user } = await getCurrentSession();

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const submittedById = user.id;

      // Get the current timestamp
      const submittedAt = new Date();

      const insertedProjects = await db
        .insertInto("Project")
        .values({
          id: createId(),
          name: input.projectTitle,
          description: input.description ?? null,
          submittedAt,
          submittedById,
          author: input.studentName,
          authorEmail: input.studentEmail,
          competitionId: input.competitionId,
          projectUrl: input.projectUrl,
          subjectLevel: input.track,
          projectType: input.projectType,
          projectCategoryId: input.projectCategoryId,
          youtubeUrl: input.youtubeUrl ?? null,
          bannerImg: imageBuffer,
        })
        .returning("id")
        .execute();

      const project = insertedProjects[0];

      return {
        success: true,
      };
    }),
});
