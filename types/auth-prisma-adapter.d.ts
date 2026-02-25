declare module "@auth/prisma-adapter" {
  import type { Adapter } from "next-auth/adapters";
  export function PrismaAdapter(prisma: unknown): Adapter;
}
