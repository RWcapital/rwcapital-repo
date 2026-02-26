import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessClient } from "@/lib/access";
import { getPresignedViewUrl } from "@/lib/s3";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return new NextResponse("Not found", { status: 404 });
  }

  const hasAccess = await canAccessClient(
    session.user.id,
    session.user.role,
    document.clientId,
  );

  if (!hasAccess) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = await getPresignedViewUrl(document.storageKey);

  return NextResponse.redirect(url);
}
