import { notFound, redirect } from "next/navigation";

import {
  addMember,
  deleteDocument,
  removeMember,
} from "@/app/(protected)/clients/[clientId]/actions";
import { UploadCard } from "@/app/(protected)/clients/[clientId]/UploadCard";
import { prisma } from "@/lib/prisma";
import { requireUser, canAccessClient } from "@/lib/access";

type ClientDocument = {
  id: string;
  originalName: string;
  createdAt: Date;
  folderPath: string | null;
  size: number;
  uploaderId: string;
};

type ClientMember = {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ClientDocumentsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await requireUser();

  if (!clientId) {
    notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      documents: {
        orderBy: [{ folderPath: "asc" }, { createdAt: "desc" }],
      },
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const hasAccess = await canAccessClient(
    session.user.id,
    session.user.role,
    clientId,
  );

  if (!hasAccess) {
    redirect("/clients");
  }

  const grouped = (client.documents as ClientDocument[]).reduce<
    Record<string, ClientDocument[]>
  >((acc, doc) => {
    const key = doc.folderPath || "Raíz";
    acc[key] = acc[key] ? [...acc[key], doc] : [doc];
    return acc;
  }, {});

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Cliente</p>
          <h1 className="text-2xl font-semibold text-zinc-900">{client.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {client.documents.length} documento
            {client.documents.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Upload card */}
        <UploadCard clientId={clientId} />
      </div>

      {/* Members panel (admin only) */}
      {isAdmin ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-base font-semibold text-zinc-900">
            Acceso de usuarios
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Los usuarios con acceso pueden ver y subir documentos de este cliente.
          </p>
          <form
            action={addMember.bind(null, clientId)}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              placeholder="correo@rwcapitalholding.com"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
            >
              Dar acceso
            </button>
          </form>

          {(client.memberships as ClientMember[]).length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Ningún usuario asignado todavía.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {(client.memberships as ClientMember[]).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 pl-3 pr-1 py-1 text-xs text-zinc-700"
                >
                  <span>{member.user.name ?? member.user.email}</span>
                  <form action={removeMember.bind(null, clientId, member.userId)}>
                    <button
                      type="submit"
                      className="flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                      title="Quitar acceso"
                    >
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Documents */}
      <section className="space-y-4">
        {client.documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
            <p className="text-sm font-medium text-zinc-500">
              No hay documentos todavía.
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Usa el formulario de arriba para subir el primer archivo.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([folder, docs]) => (
            <div
              key={folder}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-6 py-3">
                <h3 className="text-sm font-semibold text-zinc-700">{folder}</h3>
                <span className="text-xs text-zinc-400">
                  {docs.length} archivo{docs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-zinc-100">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 px-6 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {doc.originalName}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {formatBytes(doc.size)} ·{" "}
                        {new Date(doc.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                      >
                        Descargar
                      </a>
                      {isAdmin || doc.uploaderId === session.user.id ? (
                        <form action={deleteDocument.bind(null, doc.id)}>
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-400 hover:text-red-600"
                          >
                            Eliminar
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
