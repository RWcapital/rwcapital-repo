"use client";

import { useRef, useState, useTransition } from "react";
import { createFolder } from "./actions";

function FolderPlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
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

export function CreateFolderButton({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setName("");
    formRef.current?.reset();
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createFolder(clientId, formData);
      handleClose();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-95"
      >
        <FolderPlusIcon />
        Nueva carpeta
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-700">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Nueva carpeta
                </h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Organiza los documentos de este cliente.
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
            <form ref={formRef} action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="folder-name"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Nombre de la carpeta
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </span>
                  <input
                    id="folder-name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ej. 2026 / Contratos"
                    required
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-700"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Usa <code className="text-zinc-500">/</code> para subcarpetas
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
              >
                {isPending ? "Creando…" : "Crear carpeta"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
