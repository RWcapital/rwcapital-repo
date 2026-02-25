import Link from "next/link";
import type { ReactNode } from "react";

import { auth } from "@/lib/auth";
import UserMenu from "@/app/(protected)/components/UserMenu";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/clients"
              className="flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-900"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white text-xs font-bold">
                RW
              </span>
              <span className="hidden sm:inline">Capital Holding</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {session?.user?.role === "ADMIN" ? (
                <>
                  <Link
                    className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                    href="/clients"
                  >
                    Clientes
                  </Link>
                  <Link
                    className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                    href="/admin/clients"
                  >
                    Admin
                  </Link>
                  <Link
                    className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                    href="/admin/users"
                  >
                    Usuarios
                  </Link>
                </>
              ) : (
                <Link
                  className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                  href="/clients"
                >
                  Clientes
                </Link>
              )}
            </nav>
          </div>
          {session?.user ? (
            <UserMenu
              name={session.user.name ?? session.user.email ?? ""}
              role={session.user.role}
            />
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
