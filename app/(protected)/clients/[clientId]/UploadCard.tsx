"use client";

import { useRef, useState } from "react";
import { uploadDocument } from "./actions";

export function UploadCard({ clientId }: { clientId: string }) {
  const [folder, setFolder] = useState("");
  const [step, setStep] = useState<"folder" | "file">("folder");
  const formRef = useRef<HTMLFormElement>(null);

  function handleFolderConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (folder.trim()) setStep("file");
  }

  async function handleUpload(formData: FormData) {
    await uploadDocument(clientId, formData);
    setFolder("");
    setStep("folder");
    formRef.current?.reset();
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-5 md:max-w-sm">
      <p className="mb-4 text-sm font-semibold text-zinc-900">Subir documento</p>

      {step === "folder" ? (
        /* Step 1 — Crear carpeta */
        <form onSubmit={handleFolderConfirm} className="space-y-3">
          <div>
            <label
              htmlFor="newFolder"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-zinc-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              Carpeta de destino
            </label>
            <input
              id="newFolder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="Ej. 2026/Contratos"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-400">
              Opcional. Usa / para subcarpetas.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Crear carpeta
            </button>
            {folder.trim() === "" && (
              <button
                type="button"
                onClick={() => setStep("file")}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-500 transition hover:text-zinc-700"
              >
                Sin carpeta
              </button>
            )}
          </div>
        </form>
      ) : (
        /* Step 2 — Seleccionar archivo */
        <form ref={formRef} action={handleUpload} className="space-y-4">
          {/* Folder badge */}
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-zinc-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="truncate text-sm font-medium text-zinc-700">
                {folder.trim() || "Raíz"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep("folder")}
              className="ml-2 shrink-0 text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cambiar
            </button>
          </div>

          <input type="hidden" name="folderPath" value={folder.trim()} />

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-zinc-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Archivo
            </label>
            <input
              type="file"
              name="file"
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded file:border-0 file:bg-zinc-200 file:px-2 file:py-1 file:text-xs file:font-medium file:text-zinc-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Subir documento
          </button>
        </form>
      )}
    </div>
  );
}
