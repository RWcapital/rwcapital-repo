"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function FoldersIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/clients"
      ? pathname === "/clients" || pathname.startsWith("/clients/")
      : pathname === href || pathname.startsWith(href + "/");

  const item = (href: string, label: string, Icon: () => React.ReactElement) => (
    <Link
      key={href}
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
        isActive(href)
          ? "bg-white/10 text-white"
          : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
      }`}
    >
      <Icon />
      {label}
    </Link>
  );

  return (
    <nav className="flex-1 space-y-0.5 px-3 py-3">
      {item("/clients", "Clientes", FoldersIcon)}
      {role === "ADMIN" && (
        <>
          <div className="mx-1 my-2 h-px bg-white/[0.06]" />
          <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Administración
          </p>
          {item("/admin/clients", "Clientes", BuildingIcon)}
          {item("/admin/users", "Usuarios", UsersIcon)}
        </>
      )}
    </nav>
  );
}
