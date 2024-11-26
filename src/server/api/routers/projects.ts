import { SubjectLevel } from "@/db/enums";
import { magicNumberToMimeType } from "@/lib/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "kysely";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
  getCompetitions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectFrom("Competition")
      .select(["Competition.id as value", "Competition.name as label"])
      .orderBy("Competition.name", "asc")
      .execute();
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
      .where("Competition.endDate", ">=", currentDate);

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
});
