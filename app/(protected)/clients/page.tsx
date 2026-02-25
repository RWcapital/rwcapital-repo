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
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Clientes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} disponible
            {clients.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
          <p className="text-sm font-medium text-zinc-500">
            No tienes clientes asignados todavía.
          </p>
          {session.user.role === "ADMIN" ? (
            <p className="mt-1 text-xs text-zinc-400">
              Ve a{" "}
              <Link href="/admin/clients" className="underline">
                Administración → Clientes
              </Link>{" "}
              para crear el primero.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: (typeof clients)[number]) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-700">
                    {client.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    {client._count.documents}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {client._count.documents === 0
                    ? "Sin documentos"
                    : `${client._count.documents} documento${client._count.documents !== 1 ? "s" : ""}`}
                </p>
              </div>
              <p className="mt-4 flex items-center gap-1 text-xs font-medium text-zinc-400 transition group-hover:text-zinc-600">
                Ver repositorio
                <span aria-hidden>→</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
