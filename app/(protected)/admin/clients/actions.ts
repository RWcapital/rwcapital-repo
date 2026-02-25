"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";

export async function createClient(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name")?.toString().trim();
  if (!name) {
    return;
  }

  const existing = await prisma.client.findUnique({ where: { name } });
  if (existing) {
    return;
  }

  await prisma.client.create({
    data: { name },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
}

export async function deleteClient(clientId: string) {
  await requireAdmin();

  // Delete associated documents records (files on disk are not cleaned here)
  await prisma.document.deleteMany({ where: { clientId } });
  await prisma.clientMember.deleteMany({ where: { clientId } });
  await prisma.client.delete({ where: { id: clientId } });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
}

