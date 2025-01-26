import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { db } from "@/database";
import { ApprovalStatus, Role, SubjectLevel } from "@/db/enums";
import { getCurrentSession } from "@/lib/session";
import { TRPCError } from "@trpc/server";
import { createId } from "@paralleldrive/cuid2";

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
  assignUserToRole: adminProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(Role),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("input", input);

      // Search for the user with the provided email
      const user = await db
        .selectFrom("User")
        .select(["id", "email"])
        .where("User.email", "=", input.email)
        .executeTakeFirst();

      console.log("user", user);

      if (user) {
        await db
          .updateTable("User")
          .set({
            role: input.role,
          })
          .where("id", "=", user.id)
          .execute();
        console.log("user updated");
      } else {
        // If the user exists, update the user's role // If the user doesn't exist, create new user with the provided email and role
        await db
          .insertInto("User")
          .values({
            id: createId(),
            name: input.name,
            email: input.email,
            role: input.role,
          })
          .execute();
        console.log("user created");
      }
    }),
  bulkInsertUsers: adminProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          email: z.string().email(),
          // school: z.string().optional(),
          role: z.nativeEnum(Role),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Bulk input", input);

      // Start a transaction for atomicity
      await ctx.db.transaction().execute(async (trx) => {
        // Iterate over each user and perform upsert
        for (const user of input) {
          const existingUser = await trx
            .selectFrom("User")
            .select(["id", "email"])
            .where("User.email", "=", user.email)
            .executeTakeFirst();

          if (existingUser) {
            // Update the role if user exists
            await trx
              .updateTable("User")
              .set({
                role: user.role,
                name: user.name,
                // schoolId: user.school ?? existingUser.school, // Preserve existing school if not provided
              })
              .where("id", "=", existingUser.id)
              .execute();
            console.log(`User updated: ${user.email}`);
          } else {
            // Insert a new user if they don't exist
            await trx
              .insertInto("User")
              .values({
                id: createId(),
                name: user.name,
                email: user.email,
                // school: user.school,
                role: user.role,
              })
              .execute();
            console.log(`User created: ${user.email}`);
          }
        }
      });

      console.log("Bulk insert/update completed");
      return { success: true };
    }),
  getAllSchoolNames: adminProcedure.query(async () => {
    const data = await db
      .selectFrom("School")
      .select(["id", "name"])
      .orderBy("School.name", "asc")
      .execute();

    return data;
  }),
  renameSchool: adminProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .updateTable("School")
        .set({ name: input.name })
        .where("id", "=", input.id)
        .execute();
    }),
  mergeSchools: adminProcedure
    .input(z.object({ fromId: z.string(), toId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.transaction().execute(async (trx) => {
        await trx
          .updateTable("User")
          .set({ schoolId: input.toId })
          .where("schoolId", "=", input.fromId)
          .execute();

        await trx.deleteFrom("School").where("id", "=", input.fromId).execute();
      });
    }),
  getProjects: adminProcedure
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
          "Project.approvalStatus",
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
  updateProjectApprovalStatus: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        approvalStatus: z.nativeEnum(ApprovalStatus),
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
        .updateTable("Project")
        .set({
          approvalStatus: input.approvalStatus,
          approverId: session.user.id,
        })
        .where("id", "=", input.projectId)
        .execute();
    }),
  getSchools: adminProcedure
    .input(
      z.object({
        searchName: z.string().optional(),
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

      let query = ctx.db
        .selectFrom("School")
        .leftJoin("User", "School.id", "User.schoolId")
        .select([
          "School.id as id",
          "School.name as name",
          ctx.db.fn.count("User.id").as("totalUsers"),
        ])
        .groupBy(["School.id"]);

      let countQuery = ctx.db
        .selectFrom("School")
        .select((eb) => [eb.fn.count("School.id").as("count")]);

      if (input.searchName) {
        query = query.where("School.name", "ilike", `%${input.searchName}%`);
        countQuery = countQuery.where(
          "School.name",
          "ilike",
          `%${input.searchName}%`,
        );
      }

      const data = await query
        .orderBy(`School.${orderByField}`, orderDirection)
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
  createSchool: adminProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insertInto("School")
        .values({
          id: createId(),
          name: input.name,
        })
        .returning("id")
        .execute();

      return {
        success: true,
      };
    }),
  updateAssignedSchool: adminProcedure
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
          message: "You must be logged in to update your assigned school",
        });
      }

      await ctx.db
        .updateTable("User")
        .set({
          schoolId: input.schoolId,
        })
        .where("id", "=", session.user.id)
        .execute();
    }),
  getCompetitions: adminProcedure
    .input(
      z.object({
        searchName: z.string().optional(),
        pageIndex: z.number().default(1),
        pageSize: z.number().default(10),
        sortBy: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const validOrderByFields = ["name", "startDate", "endDate"] as const;
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

      let query = ctx.db
        .selectFrom("Competition")
        .leftJoin("User", "Competition.createdById", "User.id")
        .leftJoin("Project", "Competition.id", "Project.competitionId")
        .select([
          "Competition.id as id",
          "Competition.name as name",
          "Competition.description as description",
          "Competition.startDate as startDate",
          "Competition.endDate as endDate",
          "User.name as createdBy",
          "User.email as createdByEmail",
          ctx.db.fn.count("Project.id").as("totalProjects"),
        ])
        .groupBy(["Competition.id", "User.name", "User.email"]);

      let countQuery = ctx.db
        .selectFrom("Competition")
        .select((eb) => [eb.fn.count("Competition.id").as("count")]);

      if (input.searchName) {
        query = query.where(
          "Competition.name",
          "ilike",
          `%${input.searchName}%`,
        );
        countQuery = countQuery.where(
          "Competition.name",
          "ilike",
          `%${input.searchName}%`,
        );
      }

      const data = await query
        .orderBy(`Competition.${orderByField}`, orderDirection)
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
  createCompetition: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        categoryIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getCurrentSession();

      if (!session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a competition",
        });
      }

      // const result = await ctx.db
      //   .insertInto("Competition")
      //   .values({
      //     id: createId(),
      //     name: input.name,
      //     description: "",
      //     startDate: new Date(),
      //     endDate: new Date(),
      //     createdById: session.user.id,
      //   })
      //   .returning("id")
      //   .execute();

      const result = await ctx.db.transaction().execute(async (trx) => {
        // Insert into the Competition table
        const competitionInsertResult = await trx
          .insertInto("Competition")
          .values({
            id: createId(), // Generate a unique ID
            name: input.name,
            description: input.description ?? "", // Use the provided description or default to an empty string
            startDate: input.startDate,
            endDate: input.endDate,
            createdById: session.user.id, // Associate with the current user
          })
          .returning("id") // Return the ID of the newly created competition
          .executeTakeFirst(); // Execute and take the first result

        if (!competitionInsertResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create competition.",
          });
        }

        const competitionId = competitionInsertResult.id;

        // Prepare the data for CompetitionCategory insertion
        const competitionCategories = input.categoryIds.map((categoryId) => ({
          id: createId(),
          competitionId,
          categoryId,
        }));

        // Insert into the CompetitionCategory table
        await trx
          .insertInto("CompetitionCategory")
          .values(competitionCategories)
          .execute();

        // If everything succeeds, return the competition ID
        return { competitionId };
      });

      return {
        success: true,
      };
    }),
  getProjectCategories: adminProcedure
    .input(
      z.object({
        searchName: z.string().optional(),
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

      let query = ctx.db
        .selectFrom("ProjectCategory")
        .leftJoin("Project", "ProjectCategory.id", "Project.projectCategoryId")
        .select([
          "ProjectCategory.id as id",
          "ProjectCategory.name as name",
          ctx.db.fn.count("Project.id").as("totalProjects"),
        ])
        .groupBy(["ProjectCategory.id"]);

      let countQuery = ctx.db
        .selectFrom("ProjectCategory")
        .select((eb) => [eb.fn.count("ProjectCategory.id").as("count")]);

      if (input.searchName) {
        query = query.where(
          "ProjectCategory.name",
          "ilike",
          `%${input.searchName}%`,
        );
        countQuery = countQuery.where(
          "ProjectCategory.name",
          "ilike",
          `%${input.searchName}%`,
        );
      }

      const data = await query
        .orderBy(`ProjectCategory.${orderByField}`, orderDirection)
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
  createProjectCategory: adminProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insertInto("ProjectCategory")
        .values({
          id: createId(),
          name: input.name,
        })
        .returning("id")
        .execute();

      return {
        success: true,
      };
    }),
  editCategory: adminProcedure
    .input(
      z.object({
        categoryId: z.string(),
        categoryName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { categoryId, categoryName } = input;

      await ctx.db
        .updateTable("ProjectCategory")
        .set({ name: categoryName })
        .where("id", "=", categoryId)
        .execute();

      return true;
    }),
  getCompetitionById: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const competition = await ctx.db
        .selectFrom("Competition")
        .select(["id", "name", "description", "startDate", "endDate"])
        .where("id", "=", input)
        .executeTakeFirst();

      const competitionCategories = await ctx.db
        .selectFrom("CompetitionCategory")
        .select(["categoryId"])
        .where("competitionId", "=", input)
        .execute();

      return {
        ...competition,
        categoryIds: competitionCategories.map(
          (category) => category.categoryId,
        ),
      };
    }),
  editCompetition: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        categoryIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, description, startDate, endDate } = input;

      const result = await ctx.db.transaction().execute(async (trx) => {
        await trx
          .deleteFrom("CompetitionCategory")
          .where("competitionId", "=", id)
          .execute();

        const competitionCategories = input.categoryIds.map((categoryId) => ({
          id: createId(),
          competitionId: id,
          categoryId,
        }));

        await trx
          .insertInto("CompetitionCategory")
          .values(competitionCategories)
          .execute();

        await trx
          .updateTable("Competition")
          .set({ name, description, startDate, endDate })
          .where("id", "=", id)
          .execute();
      });

      return true;
    }),
});
