import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  addMember,
  deleteDocument,
  removeMember,
  deleteFolder,
} from "@/app/(protected)/clients/[clientId]/actions";
import { UploadCard } from "@/app/(protected)/clients/[clientId]/UploadCard";
import { CreateFolderButton } from "@/app/(protected)/clients/[clientId]/CreateFolderButton";
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

type ClientFolder = {
  id: string;
  name: string;
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

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const color =
    ext === "pdf"
      ? "text-red-400"
      : ["doc", "docx"].includes(ext)
      ? "text-blue-400"
      : ["xls", "xlsx"].includes(ext)
      ? "text-emerald-400"
      : ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
      ? "text-amber-400"
      : "text-zinc-400";

  return (
    <svg
      className={`h-4 w-4 shrink-0 ${color}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default async function ClientDocumentsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await requireUser();

  if (!clientId) notFound();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      documents: {
        orderBy: [{ folderPath: "asc" }, { createdAt: "desc" }],
      },
      memberships: {
        include: { user: true },
      },
      folders: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!client) notFound();

  const hasAccess = await canAccessClient(
    session.user.id,
    session.user.role,
    clientId,
  );

  if (!hasAccess) redirect("/clients");

  const docs = client.documents as ClientDocument[];

  const grouped = docs.reduce<Record<string, ClientDocument[]>>((acc, doc) => {
    const key = doc.folderPath || "Raíz";
    acc[key] = acc[key] ? [...acc[key], doc] : [doc];
    return acc;
  }, {});

  const existingFolders = Object.keys(grouped).filter((k) => k !== "Raíz");
  // Merge DB-defined folders with ones inferred from documents (deduped)
  const dbFolders = (client.folders as ClientFolder[]).map((f) => f.name);
  const allFolders = Array.from(new Set([...dbFolders, ...existingFolders])).sort();
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/clients"
          className="text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Repositorio
        </Link>
        <svg
          className="h-3.5 w-3.5 text-zinc-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-zinc-700 dark:text-zinc-200">{client.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{client.name}</h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {docs.length} documento{docs.length !== 1 ? "s" : ""}
            {allFolders.length > 0
              ? ` · ${allFolders.length} carpeta${allFolders.length !== 1 ? "s" : ""}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateFolderButton clientId={clientId} />
          <UploadCard clientId={clientId} folders={allFolders} />
        </div>
      </div>

      {/* Members panel (admin only) */}
      {isAdmin ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Acceso de usuarios
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Gestiona quién puede ver y subir documentos de este cliente.
          </p>
          <form
            action={addMember.bind(null, clientId)}
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              placeholder="correo@rwcapitalholding.com"
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-700"
              required
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-600 dark:hover:bg-zinc-500"
            >
              + Dar acceso
            </button>
          </form>

          {(client.memberships as ClientMember[]).length === 0 ? (
            <p className="mt-3 text-xs text-zinc-400">
              Ningún usuario asignado todavía.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {(client.memberships as ClientMember[]).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-3 pr-1.5 text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
                >
                  <span>{member.user.name ?? member.user.email}</span>
                  <form
                    action={removeMember.bind(null, clientId, member.userId)}
                  >
                    <button
                      type="submit"
                      className="flex h-4 w-4 items-center justify-center rounded-full leading-none text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                      title="Quitar acceso"
                    >
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Document list */}
      {docs.length === 0 && allFolders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
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
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Sin documentos todavía
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Crea una carpeta o sube un documento para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Empty DB-defined folders (no documents yet) */}
          {(client.folders as ClientFolder[])
            .filter((f) => !grouped[f.name])
            .map((folder) => (
              <div
                key={folder.id}
                className="overflow-hidden rounded-2xl border border-dashed border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-3.5 w-3.5 text-zinc-400"
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
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {folder.name}
                    </span>
                    <span className="text-[11px] text-zinc-400">· vacía</span>
                  </div>
                  {isAdmin && (
                    <form action={deleteFolder.bind(null, clientId, folder.name)}>
                      <button
                        type="submit"
                        className="text-[11px] text-zinc-400 transition hover:text-red-500"
                      >
                        Eliminar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}

          {/* Folders with documents */}
          {Object.entries(grouped).map(([folder, folderDocs]) => (
            <div
              key={folder}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              {/* Folder header */}
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-5 py-2.5 dark:border-zinc-700 dark:bg-zinc-700/30">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 text-zinc-400"
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
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {folder}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {folderDocs.length} archivo
                  {folderDocs.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Files */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
                {folderDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileIcon name={doc.originalName} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                          {doc.originalName}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {formatBytes(doc.size)} ·{" "}
                          {new Date(doc.createdAt).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Descargar
                      </a>
                      {isAdmin || doc.uploaderId === session.user.id ? (
                        <form action={deleteDocument.bind(null, doc.id)}>
                          <button
                            type="submit"
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
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
          ))}
        </div>
      )}
    </div>
  );
}
