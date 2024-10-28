"use client";

import { logoutUser } from "@/lib/session";

export function LatestPost({ user }: { user: unknown }) {
  return (
    <div className="w-full max-w-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
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
