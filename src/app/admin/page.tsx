import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";
import type { Supporter } from "@/components/SupporterCard";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "admin - stop the nita bill",
  description: "Review, export, and prepare petition signatures.",
};

type SignatureRow = {
  id: string;
  name: string | null;
  reason: string | null;
  createdAt: Date;
};

function getErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }

  return "UNKNOWN";
}

async function getAdminSignatures() {
  const generatedAt = new Date().toISOString();

  try {
    const signatures = await prisma.signature.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10000,
    });

    return {
      errorCode: null,
      generatedAt,
      signatures: signatures.map<Supporter>((signature: SignatureRow) => ({
        id: signature.id,
        name: signature.name || "Anonymous Supporter",
        reason: signature.reason || null,
        createdAt: signature.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    const errorCode = getErrorCode(error);
    console.warn("Failed to load admin signatures:", errorCode);

    return {
      errorCode,
      generatedAt,
      signatures: [],
    };
  }
}

export default async function AdminPage() {
  const { signatures, errorCode, generatedAt } = await getAdminSignatures();

  return (
    <AdminDashboard
      errorCode={errorCode}
      generatedAt={generatedAt}
      isPasswordConfigured={Boolean(process.env.ADMIN_PASSWORD)}
      signatures={signatures}
    />
  );
}
