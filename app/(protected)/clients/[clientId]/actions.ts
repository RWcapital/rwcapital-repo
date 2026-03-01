"use server";

import crypto from "node:crypto";
import path from "node:path";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser, canAccessClient } from "@/lib/access";
import { uploadToS3, deleteFromS3, getPresignedUploadUrl } from "@/lib/s3";

/** Re-lanza errores internos de Next.js (redirect, notFound) para que el framework los maneje correctamente. */
function rethrowIfNextError(err: unknown): void {
  if (
    err !== null &&
    typeof err === "object" &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_")
  ) {
    throw err;
  }
}

/**
 * Paso 1: genera una URL prefirmada para que el navegador suba el archivo
 * directamente a S3, sin pasar por la función de Vercel.
 */
export async function getUploadUrl(
  clientId: string,
  fileName: string,
  fileType: string,
): Promise<{ ok: true; uploadUrl: string; storageKey: string } | { ok: false; error: string }> {
  try {
    const session = await requireUser();
    const hasAccess = await canAccessClient(session.user.id, session.user.role, clientId);
    if (!hasAccess) return { ok: false, error: "No tienes acceso a este cliente." };

    const extension = path.extname(fileName);
    const storageKey = `${clientId}/${crypto.randomUUID()}${extension}`;
    const uploadUrl = await getPresignedUploadUrl(
      storageKey,
      fileType || "application/octet-stream",
    );

    return { ok: true, uploadUrl, storageKey };
  } catch (err) {
    rethrowIfNextError(err);
    console.error("[getUploadUrl] error:", err);
    return { ok: false, error: "No se pudo generar la URL de subida." };
  }
}

/**
 * Paso 2: registra en la base de datos el archivo ya subido a S3.
 */
export async function registerDocument(
  clientId: string,
  storageKey: string,
  originalName: string,
  mimeType: string,
  size: number,
  folderPath: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireUser();
    const hasAccess = await canAccessClient(session.user.id, session.user.role, clientId);
    if (!hasAccess) return { ok: false, error: "No tienes acceso a este cliente." };

    await prisma.document.create({
      data: {
        clientId,
        uploaderId: session.user.id,
        originalName,
        storageKey,
        mimeType: mimeType || "application/octet-stream",
        size,
        folderPath: folderPath || null,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { ok: true };
  } catch (err) {
    rethrowIfNextError(err);
    console.error("[registerDocument] error:", err);
    return { ok: false, error: "No se pudo registrar el documento." };
  }
}

export async function deleteDocument(documentId: string) {
  try {
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
  } catch (err) {
    rethrowIfNextError(err);
    console.error("[deleteDocument] error:", err);
  }
}

export async function addMember(clientId: string, formData: FormData) {
  try {
    const session = await requireUser();
    if (session.user.role !== "ADMIN") return;

    const email = formData.get("email")?.toString().toLowerCase().trim();
    if (!email) return;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

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
  } catch (err) {
    rethrowIfNextError(err);
    console.error("[addMember] error:", err);
  }
}

export async function removeMember(clientId: string, userId: string) {
  try {
    const session = await requireUser();
    if (session.user.role !== "ADMIN") return;

    await prisma.clientMember.deleteMany({
      where: { clientId, userId },
    });

    revalidatePath(`/clients/${clientId}`);
  } catch (err) {
    rethrowIfNextError(err);
    console.error("[removeMember] error:", err);
  }
}

export async function createFolder(clientId: string, formData: FormData) {
  try {
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
  } catch (err) {
    rethrowIfNextError(err);
    console.error("[createFolder] error:", err);
  }
}

export async function deleteFolder(clientId: string, folderName: string) {
  try {
    const session = await requireUser();
    if (session.user.role !== "ADMIN") return;

    await prisma.clientFolder.deleteMany({
      where: { clientId, name: folderName },
    });

    revalidatePath(`/clients/${clientId}`);
  } catch (err) {
    rethrowIfNextError(err);
    console.error("[deleteFolder] error:", err);
  }
}
