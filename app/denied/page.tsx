"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function DeniedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Beta Access Denied
          </h2>
        </div>

        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                This beta is invite-only
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You are signed in as <strong>{session?.user?.email}</strong>, but this email is not currently on the beta access list.
                </p>
                <p className="mt-2">
                  If you believe this is a mistake, please contact the Mushroom Mood team.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              router.push("/api/auth/signout");
            }}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
