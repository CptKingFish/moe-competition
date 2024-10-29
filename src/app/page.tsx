import Link from "next/link";
import { redirect } from "next/navigation";

import { api, HydrateClient } from "@/trpc/server";
import { getCurrentSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function Home() {
  const { user } = await getCurrentSession();

  if (user) {
    return redirect("/dashboard");
  }

  return (
    <HydrateClient>
      <main className="flex h-screen">
        {/* Left side - Image */}

        <div className="relative hidden h-screen bg-cover bg-center md:block md:w-1/2">
          <Image src="/login.png" alt="Login Graphic" className="" fill />
        </div>

        {/* Right side - Login */}
        <div className="flex w-full flex-col justify-center bg-gray-50 p-8 md:w-1/2 md:p-12 lg:p-16">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">Login</h1>
          <p className="mb-8 max-w-sm text-lg text-gray-600">
            Log in using your school email account to get started!
          </p>
          <Link href="/login/google">
            <Button className="group flex w-full max-w-sm transform items-center justify-center space-x-2 rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-lg font-semibold text-gray-700 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  className="fill-[#4285F4] transition-colors duration-300 group-hover:fill-white"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  className="fill-[#34A853] transition-colors duration-300 group-hover:fill-white"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  className="fill-[#FBBC05] transition-colors duration-300 group-hover:fill-white"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  className="fill-[#EA4335] transition-colors duration-300 group-hover:fill-white"
                />
              </svg>
              <span>Login with Google</span>
            </Button>
          </Link>
        </div>
      </main>
    </HydrateClient>
  );
}
