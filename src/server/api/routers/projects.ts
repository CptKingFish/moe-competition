import { SubjectLevel } from "@/db/enums";
import { magicNumberToMimeType } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { sql } from "kysely";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { getCurrentSession } from "@/lib/session";

export const projectsRouter = createTRPCRouter({
  getFeaturedProjects: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db
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
        "User.picture as authorAvatar",
        "ProjectCategory.name as category",
        "Project.subjectLevel",
        "Project.projectUrl",
        "Project.bannerImg",
        ctx.db.fn.count("Vote.id").as("totalVotes"),
      ])
      .where("Project.approvalStatus", "=", "APPROVED")
      .groupBy([
        "Project.id",
        "Project.name",
        "Project.description",
        "Project.author",
        "User.picture",
        "ProjectCategory.name",
        "Project.subjectLevel",
        "Project.projectUrl",
        "Project.bannerImg",
      ])
      .orderBy("totalVotes", "desc")
      .orderBy("Project.submittedAt", "desc")
      .limit(5)
      .execute();

    return projects.map((project) => {
      let imageSrc: string | null = null;

      if (project.bannerImg) {
        const imageBuffer = Buffer.from(project.bannerImg);
        const encodedBannerImg = imageBuffer.toString("base64");

        // Determine MIME type using magic numbers
        const bannerImgMimeType = magicNumberToMimeType(imageBuffer);

        if (bannerImgMimeType) {
          imageSrc = `data:${bannerImgMimeType};base64,${encodedBannerImg}`;
        } else {
          console.warn("Unknown image format for project ID:", project.id);
        }
      }
      return {
        ...project,
        bannerImg: imageSrc,
      };
    });
  }),
  getProjectCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectFrom("ProjectCategory")
      .select(["ProjectCategory.id as value", "ProjectCategory.name as label"])
      .orderBy("ProjectCategory.name", "asc")
      .execute();
  }),
  getCompetitions: publicProcedure
    .input(
      z
        .object({
          onlyOngoing: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const currentDate = new Date();

      // Build the base query
      let query = ctx.db
        .selectFrom("Competition")
        .select(["id as value", "name as label"])
        .orderBy("name", "asc");

      // Add filter for only ongoing competitions if 'onlyOngoing' is true
      if (input?.onlyOngoing) {
        query = query
          .where("startDate", "<=", currentDate)
          .where("endDate", ">=", currentDate);
      }

      // Execute the query
      const competitions = await query.execute();

      return competitions;
    }),
  getProjects: publicProcedure
    .input(
      z.object({
        subject: z.nativeEnum(SubjectLevel).nullable().optional(),
        competition: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        offSet: z.number(),
        excludeId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db
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
          "User.picture as authorAvatar",
          "ProjectCategory.name as category",
          "Competition.name as competition",
          "Project.subjectLevel",
          "Project.projectUrl",
          "Project.bannerImg",
          "Project.youtubeUrl",
          ctx.db.fn.count("Vote.id").as("totalVotes"),
        ])
        .where("Project.approvalStatus", "=", "APPROVED")
        .groupBy([
          "Project.id",
          "Project.name",
          "Project.description",
          "Project.author",
          "User.picture",
          "ProjectCategory.name",
          "Competition.name",
          "Project.subjectLevel",
          "Project.projectUrl",
          "Project.bannerImg",
          "Project.youtubeUrl",
        ])
        .orderBy("Project.submittedAt", "desc")
        .orderBy("totalVotes", "desc")
        .offset(input.offSet)
        .limit(3);

      if (input.subject) {
        query = query.where("Project.subjectLevel", "=", input.subject);
      }
      if (input.competition) {
        query = query.where("Competition.id", "=", input.competition);
      }
      if (input.category) {
        query = query.where("ProjectCategory.id", "=", input.category);
      }
      if (input.excludeId) {
        query = query.where("Project.id", "<>", input.excludeId);
      }

      const projects = await query.execute();

      return projects.map((project) => {
        let imageSrc: string | null = null;

        if (project.bannerImg) {
          const imageBuffer = Buffer.from(project.bannerImg);
          const encodedBannerImg = imageBuffer.toString("base64");

          // Determine MIME type using magic numbers
          const bannerImgMimeType = magicNumberToMimeType(imageBuffer);

          if (bannerImgMimeType) {
            imageSrc = `data:${bannerImgMimeType};base64,${encodedBannerImg}`;
          } else {
            console.warn("Unknown image format for project ID:", project.id);
          }
        }
        return {
          ...project,
          bannerImg: imageSrc,
        };
      });
    }),
  getProjectById: publicProcedure
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
          "ProjectCategory.name as category",
          "Competition.name as competition",
          "Project.subjectLevel",
          "Project.projectUrl",
          "Project.youtubeUrl",
          "Project.bannerImg",
          "Project.projectType",
          ctx.db.fn.count("Vote.id").as("totalVotes"),
        ])
        .groupBy([
          "Project.id",
          "Project.name",
          "Project.description",
          "Project.author",
          "User.picture",
          "ProjectCategory.name",
          "Competition.name",
          "Project.subjectLevel",
          "Project.projectUrl",
          "Project.youtubeUrl",
          "Project.projectType",
          "Project.bannerImg",
        ])
        .where("Project.id", "=", input)
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
          console.warn("Unknown image format for project ID:", project.id);
        }
      }

      return {
        ...project,
        imageSrc,
      };
    }),
  getTop10Projects: publicProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();

    const rankedProjectsCTE = ctx.db
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
        "User.picture as authorAvatar",
        "ProjectCategory.name as category",
        "Competition.name as competition",
        "Project.subjectLevel",
        "Project.projectUrl",
        "Project.bannerImg",
        ctx.db.fn.count("Vote.id").as("totalVotes"),
        sql`DENSE_RANK() OVER (ORDER BY COUNT("Vote"."id") DESC)`.as("rank"),
      ])
      .groupBy([
        "Project.id",
        "Project.name",
        "Project.description",
        "Project.author",
        "User.picture",
        "ProjectCategory.name",
        "Competition.name",
        "Project.subjectLevel",
        "Project.projectUrl",
        "Project.bannerImg",
      ])
      .where("Competition.startDate", "<=", currentDate)
      .where("Competition.endDate", ">=", currentDate)
      .where("Project.approvalStatus", "=", "APPROVED");

    const projects = await ctx.db
      .with("RankedProjects", (cte) =>
        cte.selectFrom(rankedProjectsCTE.as("sub")).selectAll(),
      )
      .selectFrom("RankedProjects")
      .selectAll()
      .where("RankedProjects.rank", "<=", 10)
      .orderBy("RankedProjects.rank", "asc")
      .execute();

    return projects.map((project) => {
      let imageSrc: string | null = null;

      if (project.bannerImg) {
        const imageBuffer = Buffer.from(project.bannerImg);
        const encodedBannerImg = imageBuffer.toString("base64");

        // Determine MIME type using magic numbers
        const bannerImgMimeType = magicNumberToMimeType(imageBuffer);

        if (bannerImgMimeType) {
          imageSrc = `data:${bannerImgMimeType};base64,${encodedBannerImg}`;
        } else {
          console.warn("Unknown image format for project ID:", project.id);
        }
      }
      return {
        ...project,
        bannerImg: imageSrc,
      };
    });
  }),
  getProjectVotes: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .selectFrom("Project")
        .where("id", "=", input)
        .select(["id", "competitionId"])
        .executeTakeFirst();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // check if the competition is ongoing
      const competition = await ctx.db
        .selectFrom("Competition")
        .where("id", "=", project.competitionId)
        .select(["startDate", "endDate"])
        .executeTakeFirst();

      let isVoteable = false;

      if (competition) {
        const currentDate = new Date();
        isVoteable =
          competition.startDate <= currentDate &&
          competition.endDate >= currentDate;
      }

      const result = await ctx.db
        .selectFrom("Vote")
        .select(sql<number>`count(*)`.as("votesCount"))
        .where("projectId", "=", input)
        .executeTakeFirst();

      const votesCount = result?.votesCount ?? 0;

      return {
        count: votesCount,
        isVoteable,
      };
    }),
  voteProject: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const session = await getCurrentSession();

      if (!session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not authenticated",
        });
      }
      const userId = session.user.id;

      const existingVote = await ctx.db
        .selectFrom("Vote")
        .where("projectId", "=", input)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existingVote) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User has already voted for this project",
        });
      }

      const project = await ctx.db
        .selectFrom("Project")
        .where("id", "=", input)
        .select("competitionId")
        .executeTakeFirst();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project is not linked to a competition.",
        });
      }

      // Check if the competition is ongoing
      const currentDate = new Date();

      const competition = await ctx.db
        .selectFrom("Competition")
        .where("id", "=", project.competitionId)
        .select(["startDate", "endDate"])
        .executeTakeFirst();

      if (
        !competition ||
        competition.startDate > currentDate ||
        competition.endDate < currentDate
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Voting is not allowed for this competition.",
        });
      }

      await ctx.db
        .insertInto("Vote")
        .values({
          id: createId(),
          projectId: input,
          userId,
          competitionId: project.competitionId,
        })
        .execute();

      return true;
    }),
  unvoteProject: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const session = await getCurrentSession();
      if (!session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not authenticated",
        });
      }

      const userId = session.user.id;

      const vote = await ctx.db
        .selectFrom("Vote")
        .where("projectId", "=", input)
        .where("userId", "=", userId)
        .select(["id", "competitionId"])
        .executeTakeFirst();

      if (!vote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vote not found",
        });
      }

      const competition = await ctx.db
        .selectFrom("Competition")
        .where("id", "=", vote.competitionId)
        .select(["startDate", "endDate"])
        .executeTakeFirst();

      if (
        !competition ||
        competition.startDate > new Date() ||
        competition.endDate < new Date()
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unvoting is not allowed for this competition.",
        });
      }

      await ctx.db
        .deleteFrom("Vote")
        .where("projectId", "=", input)
        .where("userId", "=", userId)
        .execute();

      return true;
    }),
  checkIfUserVoted: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const session = await getCurrentSession();
      if (!session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not authenticated",
        });
      }

      const userId = session.user?.id;
      const vote = await ctx.db
        .selectFrom("Vote")
        .where("projectId", "=", input)
        .where("userId", "=", userId)
        .executeTakeFirst();

      return !!vote;
    }),
});
