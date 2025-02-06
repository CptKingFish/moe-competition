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

  // // check if user email has the following pattern (@students.edu.sg or @moe.edu.sg)
  // if (!email.endsWith("@students.edu.sg") && !email.endsWith("@moe.edu.sg")) {
  //   return new Response(null, {
  //     status: 302,
  //     statusText: "Forbidden",
  //     headers: {
  //       Location: "/forbidden",
  //     },
  //   });
  // }

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

  // Check if user is a student based on email domain
  const isStudent = email.endsWith("@students.edu.sg");
  let schoolId: string | null = null;

  if (isStudent) {
    // Extract school short name from Google name (e.g., "John Doe (amkss)")
    const schoolMatch = /\(([^)]+)\)/.exec(username);
    if (schoolMatch) {
      const schoolShortName = schoolMatch[1];
      let school = null;

      if (schoolShortName) {
        school = await db
          .selectFrom("School")
          .select("id")
          .where("shortname", "=", schoolShortName)
          .executeTakeFirst();
      }
      // Find the school in the database using the short name

      if (school) {
        schoolId = school.id;
        console.log(
          `Student belongs to school: ${schoolShortName} (ID: ${schoolId})`,
        );
      } else {
        console.log(
          `No matching school found for short name: ${schoolShortName}`,
        );
      }
    } else {
      console.log("No school short name detected in Google name.");
    }
  }

  const user = await db
    .insertInto("User")
    .values({
      id: createId(),
      googleId: googleUserId,
      name: username,
      role: "STUDENT",
      email,
      picture,
      schoolId,
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
