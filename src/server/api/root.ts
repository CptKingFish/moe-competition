import { adminRouter } from "@/server/api/routers/admin";
import { teacherRouter } from "@/server/api/routers/teacher";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { projectsRouter } from "./routers/projects";
import { schoolRouter } from "./routers/school";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  teacher: teacherRouter,
  projects: projectsRouter,
  school: schoolRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
