import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { db } from "@/database";
import { Role, SubjectLevel } from "@/db/enums";

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure
    .input(
      z.object({
        searchName: z.string().optional(),
        selectedRoles: z.array(z.nativeEnum(Role)).optional(),
        selectedSchoolIds: z.array(z.string()).optional(),
        pageIndex: z.number().default(1),
        pageSize: z.number().default(10),
        sortBy: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const validOrderByFields = ["name", "email"] as const;
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
        .selectFrom("User")
        // Left join with School to get the school name
        .leftJoin("School", "User.schoolId", "School.id")
        // Use a callback in select to reference columns from joined tables
        .select([
          "User.id",
          "User.picture",
          "User.name",
          "User.email",
          "User.role",
          "School.name as school",
        ]);

      let countQuery = db
        .selectFrom("User")
        .leftJoin("School", "User.schoolId", "School.id")
        .select((eb) => [eb.fn.count("User.id").as("count")]);

      // Apply the name filter if provided
      if (input.searchName) {
        query = query.where("User.name", "ilike", `%${input.searchName}%`);
        countQuery = countQuery.where(
          "User.name",
          "ilike",
          `%${input.searchName}%`,
        );
      }

      // Apply the role filter if provided
      if (input.selectedRoles?.length) {
        query = query.where("User.role", "in", input.selectedRoles);
        countQuery = countQuery.where("User.role", "in", input.selectedRoles);
      }

      // Apply the school filter if provided
      if (input.selectedSchoolIds?.length) {
        query = query.where("User.schoolId", "in", input.selectedSchoolIds);
        countQuery = countQuery.where(
          "User.schoolId",
          "in",
          input.selectedSchoolIds,
        );
      }

      // Apply ordering, pagination, and execute the query
      const data = await query
        .orderBy(`User.${orderByField}`, orderDirection)
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
  getAllSchoolNames: adminProcedure.query(async () => {
    const data = await db.selectFrom("School").select(["id", "name"]).execute();

    return data;
  }),
  getProjects: adminProcedure
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
        .leftJoin("User", "Project.submittedById", "User.id")
        .leftJoin("Competition", "Project.competitionId", "Competition.id")
        .leftJoin(
          "ProjectCategory",
          "Project.projectCategoryId",
          "ProjectCategory.id",
        )
        .select([
          "Project.id",
          "Project.name",
          "User.name as submittedBy",
          "User.email as submittedByEmail",
          "Project.submittedAt",
          "Project.author",
          "Project.authorEmail",
          "Competition.name as competition",
          "Project.subjectLevel",
          "ProjectCategory.name as category",
        ]);

      let countQuery = db
        .selectFrom("Project")
        .leftJoin("User", "Project.submittedById", "User.id")
        .leftJoin("Competition", "Project.competitionId", "Competition.id")
        .leftJoin(
          "ProjectCategory",
          "Project.projectCategoryId",
          "ProjectCategory.id",
        )
        .select((eb) => [eb.fn.count("Project.id").as("count")]);

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
});
