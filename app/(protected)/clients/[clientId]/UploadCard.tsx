"use client";

import { useRef, useState, useTransition } from "react";
import { uploadDocument } from "./actions";

function UploadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function FileCloudIcon() {
  return (
    <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function UploadCard({
  clientId,
  folders = [],
}: {
  clientId: string;
  folders?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [folder, setFolder] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setFolder("");
    setFileName("");
    setError(null);
    formRef.current?.reset();
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      setFileName(file.name);
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await uploadDocument(clientId, formData);
        if (!result.ok) {
          setError(result.error);
        } else {
          handleClose();
        }
      } catch (err) {
        console.error("[UploadCard] error:", err);
        setError("Ocurrió un error al subir el documento. Intenta de nuevo.");
      }
    });
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-95"
      >
        <UploadIcon />
        Subir documento
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-700">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Subir documento
                </h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  El archivo quedará disponible de inmediato.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} action={handleSubmit} className="space-y-5 p-6">
              {/* Folder */}
              <div>
                <label
                  htmlFor="folderPath"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
                >
                  Carpeta de destino
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </span>
                  <input
                    id="folderPath"
                    name="folderPath"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    list="folder-suggestions"
                    placeholder="ej. 2026 / Contratos"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-700"
                  />
                  <datalist id="folder-suggestions">
                    {folders.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Opcional · usa <code className="text-zinc-500">/</code> para subcarpetas
                </p>
              </div>

              {/* Drop zone */}
              <div>
                <label
                  htmlFor="file-input"
                  className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition ${
                    isDragging
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : fileName
                      ? "border-indigo-300 bg-indigo-50/40 dark:border-indigo-700 dark:bg-indigo-900/10"
                      : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/50 dark:border-zinc-600 dark:bg-zinc-700/40 dark:hover:border-zinc-500 dark:hover:bg-zinc-700/60"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    id="file-input"
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    required
                    className="sr-only"
                    onChange={(e) =>
                      setFileName(e.target.files?.[0]?.name ?? "")
                    }
                  />

                  {fileName ? (
                    <div className="flex flex-col items-center gap-2 px-4 text-center">
                      <CheckCircleIcon />
                      <p className="break-all text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {fileName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Click para cambiar el archivo
                      </p>
                    </div>
                  ) : (
                    <>
                      <FileCloudIcon />
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                          Arrastra aquí o{" "}
                          <span className="text-indigo-600">
                            selecciona un archivo
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          PDF, Word, Excel, imágenes y más
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* Error message */}
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending || !fileName}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subiendo…
                  </span>
                ) : (
                  "Subir documento"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
