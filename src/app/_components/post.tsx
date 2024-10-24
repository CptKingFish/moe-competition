"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
// import { redirect } from "next/navigation";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
  logoutUser,
} from "@/lib/session";
// import { cookies } from "next/headers";

export function LatestPost({ user }: { user: unknown }) {
  // const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  // const createPost = api.post.create.useMutation({
  //   onSuccess: async () => {
  //     await utils.post.invalidate();
  //     setName("");
  //   },
  // });

  return (
    <div className="w-full max-w-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        {user ? (
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            onClick={async () => {
              // redirect to /logout
              await logoutUser();
            }}
          >
            Logout
          </button>
        ) : (
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            onClick={() => {
              // redirect to /login/google
              window.location.href = "/login/google";
            }}
          >
            Login with Google
          </button>
        )}
      </form>
    </div>
  );
}
