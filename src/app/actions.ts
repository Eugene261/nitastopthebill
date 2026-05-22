"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

const MOCK_SIGNATURES = [
  { name: "Kofi Mensah", reason: "This bill will cripple young freelancers in Ghana who rely on international remote work." },
  { name: "Ama Serwaa", reason: "Self-taught developers shouldn't be criminalized. We need support, not licenses." },
  { name: "Prince Osei", reason: "We already have a Cyber Security Authority and Data Protection Commission. NITA licensing is redundant." },
  { name: "Ebenezer Tetteh", reason: "Startups will leave Ghana for Nigeria or Kenya if we make tech registration this difficult." },
  { name: "Yaa Gyamfua", reason: "Let innovation thrive! Stop the certification requirements for developers." },
  { name: "Emmanuel A.", reason: "This bill is a bottleneck. We need open markets, not government gates." },
  { name: "Akosua D.", reason: "We are trying to build the next tech hub in West Africa, but this bill pushes us backward." },
  { name: "Kwesi B.", reason: "Licensing tech activities is a recipe for corruption and slow growth." }
];

async function seedIfEmpty() {
  const count = await prisma.signature.count();
  if (count === 0) {
    // Seed initial mock signatures
    for (const signature of MOCK_SIGNATURES) {
      await prisma.signature.create({
        data: {
          name: signature.name,
          reason: signature.reason,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 2) // Random time in last 2 days
        }
      });
    }
  }
}

export async function getSignatureCount() {
  try {
    await seedIfEmpty();
    const count = await prisma.signature.count();
    return count;
  } catch (error) {
    console.error("Failed to get signature count:", error);
    return 0;
  }
}

export async function getSignatures(limit = 100) {
  try {
    await seedIfEmpty();
    const signatures = await prisma.signature.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
    // Serialize Dates for client consumption
    return signatures.map(sig => ({
      id: sig.id,
      name: sig.name || "Anonymous Supporter",
      reason: sig.reason || null,
      createdAt: sig.createdAt.toISOString()
    }));
  } catch (error) {
    console.error("Failed to fetch signatures:", error);
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
    console.error("Failed to add signature:", error);
    return { success: false, error: "Failed to submit signature" };
  }
}
