import { z } from "zod";

import { teacherProcedure, createTRPCRouter } from "@/server/api/trpc";
import { db } from "@/database";
import { ApprovalStatus, ProjectType, Role, SubjectLevel } from "@/db/enums";
import { TRPCError } from "@trpc/server";
import { getCurrentSession } from "@/lib/session";
import { createId } from "@paralleldrive/cuid2";
import { magicNumberToMimeType } from "@/lib/utils";

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
          approvalStatus: "PENDING",
        })
        .returning("id")
        .execute();

      const project = insertedProjects[0];

      return {
        success: true,
      };
    }),
  getSubmittedProjects: teacherProcedure
    .input(
      z.object({
        searchName: z.string().optional(),
        selectedCompetitionIds: z.array(z.string()).optional(),
        selectedSubjectLevels: z.array(z.nativeEnum(SubjectLevel)).optional(),
        selectedCategoryIds: z.array(z.string()).optional(),
        selectedApprovedStatus: z
          .array(z.nativeEnum(ApprovalStatus))
          .optional(),
        pageIndex: z.number().default(1),
        pageSize: z.number().default(10),
        sortBy: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { session } = await getCurrentSession();

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const validOrderByFields = ["name"] as const;
      let orderByField: (typeof validOrderByFields)[number] = "name";
      let orderDirection: "asc" | "desc" = "desc";

      // Parse the sortBy input if provided
      if (input.sortBy) {
        const sortParts = input.sortBy.split(".");
        const field = sortParts[0];
        const order = sortParts[1];

        if (
          field &&
          validOrderByFields.includes(field as typeof orderByField)
        ) {
          orderByField = field as typeof orderByField;
          orderDirection = order === "desc" ? "desc" : "asc";
        }
      }

      let query = db
        .selectFrom("Project")
        .leftJoin(
          "User as submittedByUser",
          "Project.submittedById",
          "submittedByUser.id",
        )
        .leftJoin("User as approver", "Project.approverId", "approver.id")
        .leftJoin("Competition", "Project.competitionId", "Competition.id")
        .leftJoin(
          "ProjectCategory",
          "Project.projectCategoryId",
          "ProjectCategory.id",
        )
        .select([
          "Project.id",
          "Project.name",
          // "submittedByUser.name as submittedBy",
          // "submittedByUser.email as submittedByEmail",
          "approver.name as approver",
          "approver.email as approverEmail",
          "approvalStatus",
          "Project.submittedAt",
          "Project.author",
          "Project.authorEmail",
          "Competition.name as competition",
          "Project.subjectLevel",
          "ProjectCategory.name as category",
        ])
        .where("Project.submittedById", "=", session.userId);

      let countQuery = db
        .selectFrom("Project")
        .leftJoin("User", "Project.submittedById", "User.id")
        .leftJoin("Competition", "Project.competitionId", "Competition.id")
        .leftJoin(
          "ProjectCategory",
          "Project.projectCategoryId",
          "ProjectCategory.id",
        )
        .select((eb) => [eb.fn.count("Project.id").as("count")])
        .where("Project.submittedById", "=", session.userId);

      // Apply the name filter if provided
      if (input.searchName) {
        query = query.where("Project.name", "ilike", `%${input.searchName}%`);
        countQuery = countQuery.where(
          "Project.name",
          "ilike",
          `%${input.searchName}%`,
        );
      }

      // Apply the role filter if provided
      if (input.selectedCompetitionIds?.length) {
        query = query.where(
          "Project.competitionId",
          "in",
          input.selectedCompetitionIds,
        );
        countQuery = countQuery.where(
          "Project.competitionId",
          "in",
          input.selectedCompetitionIds,
        );
      }

      // Apply the school filter if provided
      if (input.selectedSubjectLevels?.length) {
        query = query.where(
          "Project.subjectLevel",
          "in",
          input.selectedSubjectLevels,
        );
        countQuery = countQuery.where(
          "Project.subjectLevel",
          "in",
          input.selectedSubjectLevels,
        );
      }

      // Apply the category filter if provided
      if (input.selectedCategoryIds?.length) {
        query = query.where(
          "Project.projectCategoryId",
          "in",
          input.selectedCategoryIds,
        );
        countQuery = countQuery.where(
          "Project.projectCategoryId",
          "in",
          input.selectedCategoryIds,
        );
      }

      // Apply the approved status filter if provided
      if (input.selectedApprovedStatus?.length) {
        query = query.where(
          "Project.approvalStatus",
          "in",
          input.selectedApprovedStatus,
        );
        countQuery = countQuery.where(
          "Project.approvalStatus",
          "in",
          input.selectedApprovedStatus,
        );
      }

      // Apply ordering, pagination, and execute the query
      const data = await query
        .orderBy(`Project.${orderByField}`, orderDirection)
        .limit(input.pageSize)
        .offset((input.pageIndex - 1) * input.pageSize)
        .execute();

      // Execute the count query
      const countResult = await countQuery.executeTakeFirst();
      const totalCount = Number(countResult?.count ?? 0);
      const pageCount = Math.ceil(totalCount / input.pageSize);

      return {
        data,
        pageCount,
      };
    }),
  getProjectById: teacherProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .selectFrom("Project")
        .leftJoin("User", "Project.authorEmail", "User.email")
        .leftJoin(
          "ProjectCategory",
          "Project.projectCategoryId",
          "ProjectCategory.id",
        )
        .leftJoin("Competition", "Project.competitionId", "Competition.id")
        .leftJoin("Vote", "Project.id", "Vote.projectId")
        .select([
          "Project.id",
          "Project.name",
          "Project.description",
          "Project.author",
          "Project.authorEmail",
          "User.picture as authorAvatar",
          "ProjectCategory.id as projectCategoryId",
          "Competition.id as competitionId",
          "Project.subjectLevel",
          "Project.projectUrl",
          "Project.youtubeUrl",
          // "Project.bannerImg",
          "Project.projectType",
        ])
        .where("Project.id", "=", input)
        .executeTakeFirst();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // // Encode the bannerImg if it exists
      // let imageSrc: string | null = null;

      // if (project.bannerImg) {
      //   const imageBuffer = Buffer.from(project.bannerImg);
      //   const encodedBannerImg = imageBuffer.toString("base64");

      //   // Determine MIME type using magic numbers
      //   const bannerImgMimeType = magicNumberToMimeType(imageBuffer);

      //   if (bannerImgMimeType) {
      //     imageSrc = `data:${bannerImgMimeType};base64,${encodedBannerImg}`;
      //   } else {
      //     console.warn("Unknown image format for project ID:", project.id);
      //   }
      // }

      return {
        ...project,
        // imageSrc,
      };
    }),
  getBannerImgByProjectId: teacherProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .selectFrom("Project")
        .where("id", "=", input)
        .select("bannerImg")
        .executeTakeFirst();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Encode the bannerImg if it exists
      let imageSrc: string | null = null;

      if (project.bannerImg) {
        const imageBuffer = Buffer.from(project.bannerImg);
        const encodedBannerImg = imageBuffer.toString("base64");

        // Determine MIME type using magic numbers
        const bannerImgMimeType = magicNumberToMimeType(imageBuffer);

        if (bannerImgMimeType) {
          imageSrc = `data:${bannerImgMimeType};base64,${encodedBannerImg}`;
        } else {
          console.warn("Unknown image format");
        }
      }

      return {
        imageSrc,
      };
    }),
});
