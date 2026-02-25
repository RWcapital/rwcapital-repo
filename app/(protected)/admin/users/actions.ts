"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";

export async function createUser(formData: FormData) {
  await requireAdmin();

  const email = formData.get("email")?.toString().toLowerCase().trim();
  const name = formData.get("name")?.toString().trim();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() as "ADMIN" | "STAFF";

  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role: role === "ADMIN" ? "ADMIN" : "STAFF",
    },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function resetPassword(userId: string, formData: FormData) {
  await requireAdmin();

  const password = formData.get("password")?.toString();
  if (!password || password.length < 8) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/users");
}
