"use server";

import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { User, Session as GeneratedSession } from "@/db/types";
import { db } from "@/database";
import { env } from "@/env";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { jsonObjectFrom } from "kysely/helpers/postgres";

// temp fix
type Session = Omit<GeneratedSession, "expiresAt"> & {
  expiresAt: Date;
};

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = cookies().get("session")?.value ?? null;
    if (token === null) {
      return { session: null, user: null };
    }
    const result = await validateSessionToken(token);
    return result;
  },
);

export async function logoutUser() {
  const { session } = await getCurrentSession();
  if (session) {
    await invalidateSession(session.id);
    cookies().delete("session");
  }

  redirect("/");
}

export async function generateSessionToken(): Promise<string> {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };

  await db.insertInto("Session").values(session).execute();

  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .selectFrom("Session")
    .select((eb) => [
      "Session.id",
      "Session.userId",
      "Session.expiresAt",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .select([
            "User.id",
            "User.name",
            "User.googleId",
            "User.role",
            "User.picture",
            "User.email",
            "User.schoolId",
          ])
          .whereRef("User.id", "=", "Session.userId"),
      ).as("user"),
    ])
    .where("Session.id", "=", sessionId)
    .executeTakeFirst();

  if (result?.user == null) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.deleteFrom("Session").where("id", "=", sessionId).execute();
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .updateTable("Session")
      .set("expiresAt", session.expiresAt)
      .where("id", "=", session.id)
      .execute();
  }
  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.deleteFrom("Session").where("id", "=", sessionId).execute();
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  if (env.NODE_ENV === "production") {
    // When deployed over HTTPS
    cookies().set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
      secure: true,
    });
  } else {
    // When deployed over HTTP (localhost)
    cookies().set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
  }
}

export async function deleteSessionTokenCookie(): Promise<void> {
  cookies().delete("session");
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
