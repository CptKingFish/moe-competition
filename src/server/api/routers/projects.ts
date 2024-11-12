import { SubjectLevel } from "@/db/enums";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const projectsRouter = createTRPCRouter({
  getFeaturedProjects: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
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
      ])
      .orderBy("totalVotes", "desc")
      .limit(5)
      .execute();
  }),
  getProjectCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectFrom("ProjectCategory")
      .select(["ProjectCategory.id as value", "ProjectCategory.name as label"])
      .execute();
  }),
  getCompetitions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectFrom("Competition")
      .select(["Competition.id as value", "Competition.name as label"])
      .execute();
  }),
  getProjects: publicProcedure
    .input(
      z.object({
        subject: z.nativeEnum(SubjectLevel).nullable(),
        competition: z.string().nullable(),
        category: z.string().nullable(),
        offSet: z.number(),
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
        ])
        .orderBy("Project.submittedAt", "desc")
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

      const projects = await query.execute();

      return projects;
    }),
  getTop10Projects: publicProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();

    return ctx.db
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
      ])
      .where("Competition.startDate", ">=", currentDate)
      .where("Competition.endDate", "<=", currentDate)
      .orderBy("totalVotes", "asc")
      .limit(10)
      .execute();
  }),
});
