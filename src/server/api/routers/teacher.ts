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

      if (!user?.schoolId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const submittedById = user.id;
      const linkedSchoolId = user.schoolId;

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
          linkedSchoolId,
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
  updateProject: teacherProcedure
    .input(
      z.object({
        projectId: z.string(),
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

      // Check if the competition is ongoing
      const competition = await db
        .selectFrom("Competition")
        .select(["startDate", "endDate"])
        .where("id", "=", input.competitionId)
        .executeTakeFirst();

      if (!competition) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      const now = new Date();
      if (
        now < new Date(competition.startDate) ||
        now > new Date(competition.endDate)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit projects from ongoing competitions.",
        });
      }

      // Dynamically build the update object
      const updateData: Record<string, unknown> = {
        name: input.projectTitle,
        description: input.description ?? null,
        author: input.studentName,
        authorEmail: input.studentEmail,
        competitionId: input.competitionId,
        projectUrl: input.projectUrl,
        subjectLevel: input.track,
        projectType: input.projectType,
        projectCategoryId: input.projectCategoryId,
        youtubeUrl: input.youtubeUrl ?? null,
        approvalStatus: "PENDING",
      };

      // Include bannerImg only if it's not null
      if (imageBuffer) {
        updateData.bannerImg = imageBuffer;
      }

      // Perform an update query on the Project table
      await db
        .updateTable("Project")
        .set(updateData)
        .where("id", "=", input.projectId)
        .execute();

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
      const { user } = await getCurrentSession();

      if (!user) {
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
          "approver.name as approver",
          "approver.email as approverEmail",
          "approvalStatus",
          "Project.submittedAt",
          "Project.author",
          "Project.authorEmail",
          "Competition.name as competition",
          "Project.subjectLevel",
          "ProjectCategory.name as category",
          "Competition.endDate as competitionEndDate",
        ])
        .where("Project.linkedSchoolId", "=", user.schoolId);

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
        .where("Project.linkedSchoolId", "=", user.schoolId);

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

      return {
        ...project,
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
  getBannerImgByDraftId: teacherProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .selectFrom("ProjectDraft")
        .where("id", "=", input)
        .select("bannerImg")
        .executeTakeFirst();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft not found",
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
  withdrawSubmission: teacherProcedure
    .input(z.object({ id: z.string(), saveAsDraft: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = await getCurrentSession();

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // const project = await ctx.db
      //   .selectFrom("Project")
      //   .where("id", "=", input.id)
      //   .select(["approvalStatus", "submittedById", "competitionId"])
      //   .executeTakeFirst();

      const project = await ctx.db
        .selectFrom("Project")
        .where("id", "=", input.id)
        .selectAll()
        .executeTakeFirst();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // User can only withdraw submissions before the competition ends
      const competition = await ctx.db
        .selectFrom("Competition")
        .where("id", "=", project.competitionId)
        .select("endDate")
        .executeTakeFirst();

      if (!competition) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      const now = new Date();
      if (now > new Date(competition.endDate)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You can only withdraw submissions before the competition ends",
        });
      }

      // if (project.approvalStatus !== "PENDING") {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "You can only withdraw pending submissions",
      //   });
      // }

      // if (project.submittedById !== user.id) {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "You can only withdraw your own submissions",
      //   });
      // }

      // Save the project as a draft if requested
      if (input.saveAsDraft) {
        await db
          .insertInto("ProjectDraft")
          .values({
            id: project.id,
            name: project.name,
            description: project.description,
            draftedAt: new Date(),
            draftedById: project.submittedById,
            linkedSchoolId: project.linkedSchoolId,
            author: project.author,
            authorEmail: project.authorEmail,
            competitionId: project.competitionId,
            projectUrl: project.projectUrl,
            subjectLevel: project.subjectLevel,
            projectType: project.projectType,
            projectCategoryId: project.projectCategoryId,
            youtubeUrl: project.youtubeUrl,
            bannerImg: project.bannerImg,
          })
          .execute();
      }

      await ctx.db.deleteFrom("Project").where("id", "=", input.id).execute();

      return {
        success: true,
      };
    }),
  saveProjectDraft: teacherProcedure
    .input(
      z.object({
        projectTitle: z.string().min(3),
        track: z.nativeEnum(SubjectLevel).optional(),
        projectType: z.nativeEnum(ProjectType).optional(),
        projectUrl: z.string().url().optional(),
        studentName: z.string().min(3).optional(),
        studentEmail: z.string().email().optional(),
        youtubeUrl: z.string().url().optional(),
        description: z.string().optional(),
        bannerImg: z.string().optional(),
        competitionId: z.string().optional(),
        projectCategoryId: z.string().optional(),
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

      if (!input.projectTitle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project title is required.",
        });
      }

      // Retrieve the user ID from the session
      const { user } = await getCurrentSession();

      if (!user?.schoolId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const draftedById = user.id;
      const linkedSchoolId = user.schoolId;

      // Get the current timestamp
      const draftedAt = new Date();

      const draftedProjects = await db
        .insertInto("ProjectDraft")
        .values({
          id: createId(),
          name: input.projectTitle,
          description: input.description ?? null,
          draftedAt,
          draftedById,
          linkedSchoolId,
          author: input.studentName ?? null,
          authorEmail: input.studentEmail ?? null,
          competitionId: input.competitionId ?? null,
          projectUrl: input.projectUrl ?? null,
          subjectLevel: input.track ?? null,
          projectType: input.projectType ?? null,
          projectCategoryId: input.projectCategoryId ?? null,
          youtubeUrl: input.youtubeUrl ?? null,
          bannerImg: imageBuffer,
        })
        .returning("id")
        .execute();

      const project = draftedProjects[0];

      return {
        success: true,
      };
    }),
  getProjectDrafts: teacherProcedure
    .input(
      z.object({
        searchName: z.string().optional(),
        selectedCompetitionIds: z.array(z.string()).optional(),
        selectedSubjectLevels: z.array(z.nativeEnum(SubjectLevel)).optional(),
        selectedCategoryIds: z.array(z.string()).optional(),
        pageIndex: z.number().default(1),
        pageSize: z.number().default(10),
        sortBy: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = await getCurrentSession();

      if (!user) {
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
        .selectFrom("ProjectDraft")
        .leftJoin(
          "User as draftedByUser",
          "ProjectDraft.draftedById",
          "draftedByUser.id",
        )
        .leftJoin("Competition", "ProjectDraft.competitionId", "Competition.id")
        .leftJoin(
          "ProjectCategory",
          "ProjectDraft.projectCategoryId",
          "ProjectCategory.id",
        )
        .select([
          "ProjectDraft.id",
          "ProjectDraft.name",
          "ProjectDraft.draftedAt",
          "ProjectDraft.author",
          "ProjectDraft.authorEmail",
          "Competition.name as competition",
          "ProjectDraft.subjectLevel",
          "ProjectCategory.name as category",
        ])
        .where("ProjectDraft.linkedSchoolId", "=", user.schoolId);

      let countQuery = db
        .selectFrom("ProjectDraft")
        .leftJoin("User", "ProjectDraft.draftedById", "User.id")
        .leftJoin("Competition", "ProjectDraft.competitionId", "Competition.id")
        .leftJoin(
          "ProjectCategory",
          "ProjectDraft.projectCategoryId",
          "ProjectCategory.id",
        )
        .select((eb) => [eb.fn.count("ProjectDraft.id").as("count")])
        .where("ProjectDraft.linkedSchoolId", "=", user.schoolId);

      // Apply the name filter if provided
      if (input.searchName) {
        query = query.where(
          "ProjectDraft.name",
          "ilike",
          `%${input.searchName}%`,
        );
        countQuery = countQuery.where(
          "ProjectDraft.name",
          "ilike",
          `%${input.searchName}%`,
        );
      }

      // Apply the role filter if provided
      if (input.selectedCompetitionIds?.length) {
        query = query.where(
          "ProjectDraft.competitionId",
          "in",
          input.selectedCompetitionIds,
        );
        countQuery = countQuery.where(
          "ProjectDraft.competitionId",
          "in",
          input.selectedCompetitionIds,
        );
      }

      // Apply the school filter if provided
      if (input.selectedSubjectLevels?.length) {
        query = query.where(
          "ProjectDraft.subjectLevel",
          "in",
          input.selectedSubjectLevels,
        );
        countQuery = countQuery.where(
          "ProjectDraft.subjectLevel",
          "in",
          input.selectedSubjectLevels,
        );
      }

      // Apply the category filter if provided
      if (input.selectedCategoryIds?.length) {
        query = query.where(
          "ProjectDraft.projectCategoryId",
          "in",
          input.selectedCategoryIds,
        );
        countQuery = countQuery.where(
          "ProjectDraft.projectCategoryId",
          "in",
          input.selectedCategoryIds,
        );
      }

      // Apply ordering, pagination, and execute the query
      const data = await query
        .orderBy(`ProjectDraft.${orderByField}`, orderDirection)
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
  editProjectDraft: teacherProcedure
    .input(
      z.object({
        draftId: z.string(),
        projectTitle: z.string().min(3),
        track: z.nativeEnum(SubjectLevel).optional(),
        projectType: z.nativeEnum(ProjectType).optional(),
        projectUrl: z.string().url().optional(),
        studentName: z.string().min(3).optional(),
        studentEmail: z.string().email().optional(),
        youtubeUrl: z.string().url().optional(),
        description: z.string().optional(),
        bannerImg: z.string().optional(),
        competitionId: z.string().optional(),
        projectCategoryId: z.string().optional(),
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

      // Check if the competition is ongoing
      if (input.competitionId) {
        const competition = await db
          .selectFrom("Competition")
          .select(["startDate", "endDate"])
          .where("id", "=", input.competitionId)
          .executeTakeFirst();

        if (!competition) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Competition not found",
          });
        }

        const now = new Date();
        if (
          now < new Date(competition.startDate) ||
          now > new Date(competition.endDate)
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only edit projects from ongoing competitions.",
          });
        }
      }

      // Dynamically build the update object
      const updateData: Record<string, unknown> = {
        name: input.projectTitle,
        description: input.description ?? null,
        author: input.studentName ?? null,
        authorEmail: input.studentEmail ?? null,
        competitionId: input.competitionId ?? null,
        projectUrl: input.projectUrl ?? null,
        subjectLevel: input.track ?? null,
        projectType: input.projectType ?? null,
        projectCategoryId: input.projectCategoryId ?? null,
        youtubeUrl: input.youtubeUrl ?? null,
      };

      // Include bannerImg only if it's not null
      if (imageBuffer) {
        updateData.bannerImg = imageBuffer;
      }

      // Perform an update query on the Project table
      await db
        .updateTable("ProjectDraft")
        .set(updateData)
        .where("id", "=", input.draftId)
        .execute();

      return {
        success: true,
      };
    }),
  getProjectDraftById: teacherProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .selectFrom("ProjectDraft")
        .leftJoin("User", "ProjectDraft.authorEmail", "User.email")
        .leftJoin(
          "ProjectCategory",
          "ProjectDraft.projectCategoryId",
          "ProjectCategory.id",
        )
        .leftJoin("Competition", "ProjectDraft.competitionId", "Competition.id")
        .select([
          "ProjectDraft.id",
          "ProjectDraft.name",
          "ProjectDraft.description",
          "ProjectDraft.author",
          "ProjectDraft.authorEmail",
          "User.picture as authorAvatar",
          "ProjectCategory.id as projectCategoryId",
          "Competition.id as competitionId",
          "ProjectDraft.subjectLevel",
          "ProjectDraft.projectUrl",
          "ProjectDraft.youtubeUrl",
          "ProjectDraft.projectType",
        ])
        .where("ProjectDraft.id", "=", input)
        .executeTakeFirst();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft not found",
        });
      }

      return {
        ...project,
      };
    }),
  deleteProjectDraft: teacherProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.deleteFrom("ProjectDraft").where("id", "=", input).execute();

      return {
        success: true,
      };
    }),
});
