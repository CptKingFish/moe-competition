import { type DB } from "./db/types"; // this is the Database interface we defined earlier
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<DB>({
  dialect,
  ...(process.env.NODE_ENV !== "production" && {
    log(event) {
      if (event.level === "error") {
        console.error("Query failed : ", {
          durationMs: event.queryDurationMillis,
          error: event.error,
          sql: event.query.sql,
        });
      } else {
        // `'query'`
        console.log("Query executed : ", {
          durationMs: event.queryDurationMillis,
          sql: event.query.sql,
        });
      }
    },
  }),
});
