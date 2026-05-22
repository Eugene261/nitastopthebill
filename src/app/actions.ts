"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

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

export async function getSignatureCount() {
  try {
    const count = await prisma.signature.count();
    return count;
  } catch (error) {
    console.warn("Failed to get signature count:", getErrorCode(error));
    return 0;
  }
}

export async function getSignatures(limit = 100) {
  try {
    const signatures = await prisma.signature.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
    // Serialize Dates for client consumption
    return signatures.map((sig: SignatureRow) => ({
      id: sig.id,
      name: sig.name || "Anonymous Supporter",
      reason: sig.reason || null,
      createdAt: sig.createdAt.toISOString()
    }));
  } catch (error) {
    console.warn("Failed to fetch signatures:", getErrorCode(error));
    return [];
  }
}


export async function addSignature(name?: string, reason?: string) {
  try {
    const formattedName = name?.trim() || null;
    const formattedReason = reason?.trim() || null;

    const newSignature = await prisma.signature.create({
      data: {
        name: formattedName,
        reason: formattedReason
      }
    });

    revalidatePath("/");
    return {
      success: true,
      signature: {
        id: newSignature.id,
        name: newSignature.name || "Anonymous Supporter",
        reason: newSignature.reason || null,
        createdAt: newSignature.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.warn("Failed to add signature:", getErrorCode(error));
    return { success: false, error: "Failed to submit signature" };
  }
}
