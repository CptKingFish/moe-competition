import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

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
        "User.picture",
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
});
