import type { ReactNode } from "react";

import { auth } from "@/lib/auth";
import { SidebarNav } from "@/app/(protected)/components/SidebarNav";
import { SignOutButton } from "@/app/(protected)/components/SignOutButton";
import { ThemeToggle } from "@/app/(protected)/components/ThemeToggle";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "Usuario";
  const role = session?.user?.role ?? "USER";

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold tracking-wide text-white">
            RW
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              RW Capital
            </p>
            <p className="text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">Holding</p>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav role={role} />

        {/* User footer */}
        <div className="mt-auto flex items-center gap-2 border-t border-zinc-200 px-4 py-3.5 dark:border-zinc-800">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold uppercase text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium leading-tight text-zinc-800 dark:text-zinc-200">
              {name.split(" ")[0]}
            </p>
            <p className="text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">
              {role === "ADMIN" ? "Administrador" : "Usuario"}
            </p>
          </div>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-[#f4f5f7] dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
