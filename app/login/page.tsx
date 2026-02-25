"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos.");
        return;
      }

      window.location.href = "/clients";
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] dark:bg-zinc-950">
      {/* Sidebar branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#0f1117] p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold tracking-wide text-white">
            RW
          </div>
          <span className="text-sm font-semibold text-white">RW Capital Holding</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-snug text-white">
            Repositorio interno de documentos
          </h2>
          <p className="mt-4 text-sm text-zinc-400">
            Acceso restringido. Solo personal autorizado.
          </p>
        </div>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} RW Capital Holding. Uso interno.
        </p>
      </div>

      {/* Form */}
      <div className="flex w-full flex-col items-center justify-center px-8 lg:w-1/2 dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <p className="mb-8 text-center text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 lg:hidden">
            RW Capital Holding
          </p>

          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ingresa con tu correo corporativo.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-indigo-800"
                placeholder="correo@rwcapitalholding.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-indigo-800"
                required
              />
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-900/20">
                <span className="text-red-500">⚠</span>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              {isPending ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
