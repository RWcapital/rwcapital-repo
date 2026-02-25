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
        <h1 className="text-2xl font-semibold text-zinc-900">Usuarios</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Administra los usuarios con acceso al sistema.
        </p>
      </div>

      {/* Create user form */}
      <form
        action={createUser}
        className="rounded-2xl border border-zinc-200 bg-white p-6"
      >
        <h2 className="mb-4 text-base font-semibold text-zinc-900">
          Crear nuevo usuario
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-zinc-700" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="correo@rwcapitalholding.com"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-zinc-700"
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
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="role"
            >
              Rol
            </label>
            <select
              id="role"
              name="role"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Crear usuario
          </button>
        </div>
      </form>

      {/* Users list */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-6 py-3 text-left font-medium text-zinc-500">
                Nombre
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500">
                Email
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500">
                Rol
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500">
                Clientes
              </th>
              <th className="px-6 py-3 text-left font-medium text-zinc-500">
                Creado
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
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
                <tr key={user.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {user.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Staff"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {user._count.memberships}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
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
