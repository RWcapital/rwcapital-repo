import Link from "next/link";

import { createClient } from "@/app/(protected)/admin/clients/actions";
import { DeleteClientButton } from "@/app/(protected)/admin/clients/DeleteClientButton";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";

export default async function AdminClientsPage() {
  await requireAdmin();

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { documents: true, memberships: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Administración de clientes
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Crea y gestiona los clientes del repositorio.
        </p>
      </div>

      {/* Create form */}
      <form
        action={createClient}
        className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <p className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Nuevo cliente</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500" htmlFor="name">
              Nombre del cliente
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-600 dark:focus:ring-indigo-800"
              placeholder="Ej. Grupo Andino"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-95"
          >
            Crear cliente
          </button>
        </div>
      </form>

      {/* Client list */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-zinc-500">
              No hay clientes creados todavía.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <span>Nombre</span>
              <span className="text-center">Docs</span>
              <span className="text-center">Usuarios</span>
              <span />
            </div>
            {clients.map((client: (typeof clients)[number]) => (
              <div
                key={client.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-700/40"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {client.name}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 text-center dark:bg-zinc-700 dark:text-zinc-300">
                  {client._count.documents}
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 text-center dark:bg-zinc-700 dark:text-zinc-300">
                  {client._count.memberships}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  >
                    Ver
                  </Link>
                  <DeleteClientButton
                    clientId={client.id}
                    clientName={client.name}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

