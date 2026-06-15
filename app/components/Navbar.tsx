"use client";

import { signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Signed in as <strong>{session.user.email}</strong>
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut({ redirect: true });
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
