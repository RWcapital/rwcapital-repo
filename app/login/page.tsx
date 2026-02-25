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
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 lg:flex">
        <div>
          <span className="text-xl font-bold tracking-tight text-white">
            RW Capital Holding
          </span>
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
      <div className="flex w-full flex-col items-center justify-center px-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <p className="mb-8 text-center text-lg font-bold tracking-tight text-zinc-900 lg:hidden">
            RW Capital Holding
          </p>

          <h1 className="text-2xl font-semibold text-zinc-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Ingresa con tu correo corporativo.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="correo@rwcapitalholding.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                required
              />
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <span className="text-red-500">⚠</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
