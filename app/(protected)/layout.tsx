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
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold tracking-wide text-white">
            RW
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              RW Capital
            </p>
            <p className="text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">Holding</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Cerrar sesión */}
        <div className="px-3 pb-3">
          <SignOutButton />
        </div>

        {/* Perfil */}
        <div className="flex items-center gap-2.5 rounded-xl bg-zinc-50 px-3 py-2.5 mx-3 mb-4 dark:bg-zinc-800">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold uppercase text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold leading-tight text-zinc-800 dark:text-zinc-200">
              {name.split(" ")[0]}
            </p>
            <p className="text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">
              {role === "ADMIN" ? "Administrador" : "Usuario"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav role={role} />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-[#f4f5f7] dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
