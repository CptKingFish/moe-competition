import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { getCurrentSession } from "@/lib/session";
import { TRPCError } from "@trpc/server";

export const schoolRouter = createTRPCRouter({
  getAllSchoolNames: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .selectFrom("School")
      .select(["id", "name"])
      .orderBy("School.name", "asc")
      .execute();

    return data;
  }),
  linkUserToSchool: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getCurrentSession();
      if (!session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "You must be logged in to update a project's approval status",
        });
      }

      const result = await ctx.db
        .updateTable("User")
        .set({
          schoolId: input.schoolId,
        })
        .where("id", "=", session.user.id)
        .execute();
    }),
});
