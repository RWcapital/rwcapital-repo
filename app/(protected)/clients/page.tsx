import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

export default async function ClientsPage() {
  const session = await requireUser();

  const clients = await prisma.client.findMany({
    where:
      session.user.role === "ADMIN"
        ? undefined
        : {
            memberships: {
              some: {
                userId: session.user.id,
              },
            },
          },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Repositorio</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        {session.user.role === "ADMIN" && (
          <Link
            href="/admin/clients"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            + Nuevo cliente
          </Link>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-600">
            Sin clientes asignados
          </p>
          {session.user.role === "ADMIN" ? (
            <p className="mt-1 text-xs text-zinc-400">
              Crea uno en{" "}
              <Link
                href="/admin/clients"
                className="text-indigo-500 hover:underline"
              >
                Administración → Clientes
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto] border-b border-zinc-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <span>Cliente</span>
            <span>Docs</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-100">
            {clients.map((client: (typeof clients)[number]) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="group grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 transition hover:bg-zinc-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                      />
                    </svg>
                  </div>
                  <p className="truncate text-sm font-medium text-zinc-900 transition group-hover:text-indigo-600">
                    {client.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    {client._count.documents}
                  </span>
                  <svg
                    className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
