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
        <h1 className="text-2xl font-semibold text-zinc-900">
          Administración de clientes
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Crea y gestiona los clientes del repositorio.
        </p>
      </div>

      {/* Create form */}
      <form
        action={createClient}
        className="rounded-2xl border border-zinc-200 bg-white p-6"
      >
        <p className="mb-4 text-sm font-semibold text-zinc-900">Nuevo cliente</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500" htmlFor="name">
              Nombre del cliente
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
              placeholder="Ej. Grupo Andino"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Crear cliente
          </button>
        </div>
      </form>

      {/* Client list */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-zinc-500">
              No hay clientes creados todavía.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <span>Nombre</span>
              <span className="text-center">Docs</span>
              <span className="text-center">Usuarios</span>
              <span />
            </div>
            {clients.map((client: (typeof clients)[number]) => (
              <div
                key={client.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {client.name}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 text-center">
                  {client._count.documents}
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 text-center">
                  {client._count.memberships}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-900"
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

