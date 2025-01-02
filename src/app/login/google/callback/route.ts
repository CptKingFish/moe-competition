import {
  generateSessionToken,
  createSession,
  setSessionTokenCookie,
} from "@/lib/session";
import { google } from "@/lib/auth";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

import type { OAuth2Tokens } from "arctic";
import { decodeIdToken } from "arctic";
import { db } from "@/database";

type DecodedToken = {
  sub: string;
  name: string;
  email: string;
  picture: string;
};

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookies().get("google_code_verifier")?.value ?? null;
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    });
  }
  const claims = decodeIdToken(tokens.idToken()) as DecodedToken;
  const googleUserId = claims.sub;
  const username = claims.name;
  const email = claims.email;
  const picture = claims.picture;

  const existingUser = await db
    .selectFrom("User")
    .selectAll()
    // .where("User.googleId", "=", googleUserId)
    .where("User.email", "=", email)
    .executeTakeFirst();

  if (existingUser) {
    if (!existingUser.googleId) {
      await db
        .updateTable("User")
        .set({
          name: username,
          googleId: googleUserId,
          picture,
        })
        .where("User.id", "=", existingUser.id)
        .execute();
    }

    const sessionToken = await generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return response;
  }

  const user = await db
    .insertInto("User")
    .values({
      googleId: googleUserId,
      name: username,
      role: "STUDENT",
      email,
      picture,
      id: createId(),
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  const sessionToken = await generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: "/dashboard",
    },
  });
  await setSessionTokenCookie(sessionToken, session.expiresAt);
  return response;
}
