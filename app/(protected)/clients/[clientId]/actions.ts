"use server";

import crypto from "node:crypto";
import path from "node:path";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser, canAccessClient } from "@/lib/access";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

export async function uploadDocument(
  clientId: string,
  formData: FormData,
) {
  const session = await requireUser();
  const hasAccess = await canAccessClient(
    session.user.id,
    session.user.role,
    clientId,
  );

  if (!hasAccess) {
    return;
  }

  const file = formData.get("file") as File | null;
  const folderPath = formData.get("folderPath")?.toString().trim() || null;

  if (!file) {
    return;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name);
  const storageKey = `${clientId}/${crypto.randomUUID()}${extension}`;

  await uploadToS3(storageKey, buffer, file.type || "application/octet-stream");

  await prisma.document.create({
    data: {
      clientId,
      uploaderId: session.user.id,
      originalName: file.name,
      storageKey,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
      folderPath: folderPath || null,
    },
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteDocument(documentId: string) {
  const session = await requireUser();

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) return;

  const hasAccess = await canAccessClient(
    session.user.id,
    session.user.role,
    document.clientId,
  );

  if (!hasAccess) return;

  // Only admin or the uploader can delete
  if (session.user.role !== "ADMIN" && document.uploaderId !== session.user.id) {
    return;
  }

  try {
    await deleteFromS3(document.storageKey);
  } catch {
    // Object may already be gone, continue
  }

  await prisma.document.delete({ where: { id: documentId } });
  revalidatePath(`/clients/${document.clientId}`);
}

export async function addMember(clientId: string, formData: FormData) {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    return;
  }

  const email = formData.get("email")?.toString().toLowerCase().trim();
  if (!email) {
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return;
  }

  await prisma.clientMember.upsert({
    where: {
      clientId_userId: {
        clientId,
        userId: user.id,
      },
    },
    create: {
      clientId,
      userId: user.id,
    },
    update: {},
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function removeMember(clientId: string, userId: string) {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") return;

  await prisma.clientMember.deleteMany({
    where: { clientId, userId },
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function createFolder(clientId: string, formData: FormData) {
  const session = await requireUser();
  const hasAccess = await canAccessClient(
    session.user.id,
    session.user.role,
    clientId,
  );
  if (!hasAccess) return;

  const name = formData.get("name")?.toString().trim();
  if (!name) return;

  await prisma.clientFolder.upsert({
    where: { clientId_name: { clientId, name } },
    create: { clientId, name },
    update: {},
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteFolder(clientId: string, folderName: string) {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") return;

  await prisma.clientFolder.deleteMany({
    where: { clientId, name: folderName },
  });

  revalidatePath(`/clients/${clientId}`);
}
