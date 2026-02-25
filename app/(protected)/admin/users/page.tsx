import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";
import { createUser, deleteUser } from "@/app/(protected)/admin/users/actions";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { memberships: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Usuarios</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Administra los usuarios con acceso al sistema.
        </p>
      </div>

      {/* Create user form */}
      <form
        action={createUser}
        className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <p className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Nuevo usuario</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-600 dark:focus:ring-indigo-800"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-600 dark:focus:ring-indigo-800"
              placeholder="correo@rwcapitalholding.com"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-600 dark:focus:ring-indigo-800"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              htmlFor="role"
            >
              Rol
            </label>
            <select
              id="role"
              name="role"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:focus:bg-zinc-600 dark:focus:ring-indigo-800"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-95"
          >
            Crear usuario
          </button>
        </div>
      </form>

      {/* Users list */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <table className="w-full text-sm">
          <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Nombre
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Rol
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Clientes
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Creado
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-zinc-500"
                >
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              users.map((user: (typeof users)[number]) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                    {user.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Staff"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                    {user._count.memberships}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteUser.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
