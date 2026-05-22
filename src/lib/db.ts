import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { setDefaultAutoSelectFamily } from "node:net";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.replace(
    "sslmode=require",
    "sslmode=verify-full",
  );

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set!");
  }

  // Avoid Node's multi-address connection attempts hanging on VPN IPv6 routes.
  setDefaultAutoSelectFamily(false);

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export { prisma };
