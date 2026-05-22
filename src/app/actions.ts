"use server";

import prisma from "@/lib/db";
import {
  hashEmail,
  isValidEmail,
  normalizeEmail,
} from "@/lib/signatureVerification";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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

function getClientIp(headerStore: Headers) {
  const forwardedFor = headerStore.get("x-forwarded-for");

  return (
    headerStore.get("cf-connecting-ip") ??
    headerStore.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim()
  );
}

async function verifyTurnstile(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  if (!token) {
    return false;
  }

  try {
    const headerStore = await headers();
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: getClientIp(headerStore),
        }),
      },
    );
    const result = (await response.json()) as { success?: boolean };

    return Boolean(result.success);
  } catch (error) {
    console.warn("Failed to verify Turnstile:", getErrorCode(error));
    return false;
  }
}

export async function getSignatureCount() {
  try {
    const count = await prisma.signature.count({
      where: {
        OR: [
          {
            verifiedAt: {
              not: null,
            },
          },
          {
            emailHash: null,
          },
        ],
      },
    });
    return count;
  } catch (error) {
    console.warn("Failed to get signature count:", getErrorCode(error));
    return 0;
  }
}

export async function getSignatures(limit = 100) {
  try {
    const signatures = await prisma.signature.findMany({
      where: {
        OR: [
          {
            verifiedAt: {
              not: null,
            },
          },
          {
            emailHash: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
    // Serialize Dates for client consumption
    return signatures.map((sig: SignatureRow) => ({
      id: sig.id,
      name: sig.name || "Anonymous Supporter",
      reason: sig.reason || null,
      createdAt: sig.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn("Failed to fetch signatures:", getErrorCode(error));
    return [];
  }
}


export async function addSignature(
  name?: string,
  reason?: string,
  email?: string,
  turnstileToken?: string,
) {
  try {
    const isVerified = await verifyTurnstile(turnstileToken);

    if (!isVerified) {
      return { success: false, error: "Please complete verification." };
    }

    const formattedEmail = normalizeEmail(email);

    if (!isValidEmail(formattedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const formattedName = name?.trim() || null;
    const formattedReason = reason?.trim() || null;
    const emailHash = hashEmail(formattedEmail);
    const existingSignature = await prisma.signature.findUnique({
      where: {
        emailHash,
      },
    });

    if (existingSignature?.verifiedAt) {
      return {
        success: false,
        error: "This email has already signed the petition.",
      };
    }

    const countedAt = new Date();
    const signature = existingSignature
      ? await prisma.signature.update({
          where: {
            id: existingSignature.id,
          },
          data: {
            name: formattedName,
            reason: formattedReason,
            verificationExpiresAt: null,
            verificationTokenHash: null,
            verifiedAt: countedAt,
          },
        })
      : await prisma.signature.create({
          data: {
            name: formattedName,
            reason: formattedReason,
            emailHash,
            verifiedAt: countedAt,
          },
        });

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      signature: {
        id: signature.id,
        name: signature.name || "Anonymous Supporter",
        reason: signature.reason || null,
        createdAt: signature.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.warn("Failed to add signature:", getErrorCode(error));
    return { success: false, error: "Failed to submit signature" };
  }
}
