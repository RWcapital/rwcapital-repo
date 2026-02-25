"use client";

import { signOut } from "next-auth/react";

export default function UserMenu({
  name,
  role,
}: {
  name: string;
  role?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="hidden flex-col items-end sm:flex">
        <span className="text-sm font-medium text-zinc-800 leading-none">
          {name}
        </span>
        {role ? (
          <span className="mt-1 text-xs text-zinc-500 uppercase tracking-wide">
            {role === "ADMIN" ? "Administrador" : "Staff"}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => signOut({ redirectTo: "/login" })}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
      >
        Salir
      </button>
    </div>
  );
}
