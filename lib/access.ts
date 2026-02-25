import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

export async function canAccessClient(
  userId: string,
  role: string,
  clientId: string,
) {
  if (role === "ADMIN") {
    return true;
  }

  const membership = await prisma.clientMember.findUnique({
    where: {
      clientId_userId: {
        clientId,
        userId,
      },
    },
  });

  return Boolean(membership);
}
