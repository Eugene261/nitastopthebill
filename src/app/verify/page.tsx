import Link from "next/link";
import prisma from "@/lib/db";
import { hashToken } from "@/lib/signatureVerification";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type VerifyPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

async function verifySignature(token?: string) {
  if (!token) {
    return "missing";
  }

  const verificationTokenHash = hashToken(token);
  const signature = await prisma.signature.findUnique({
    where: {
      verificationTokenHash,
    },
  });

  if (!signature) {
    return "invalid";
  }

  if (
    !signature.verificationExpiresAt ||
    signature.verificationExpiresAt.getTime() < Date.now()
  ) {
    await prisma.signature.update({
      where: {
        id: signature.id,
      },
      data: {
        verificationExpiresAt: null,
        verificationTokenHash: null,
      },
    });

    return "expired";
  }

  await prisma.signature.update({
    where: {
      id: signature.id,
    },
    data: {
      verificationExpiresAt: null,
      verificationTokenHash: null,
      verifiedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return "verified";
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams;
  const status = await verifySignature(token);
  const isVerified = status === "verified";

  return (
    <main className="min-h-screen bg-white px-6 py-20 text-black">
      <div className="mx-auto max-w-[560px] space-y-6">
        <p className="text-[12px] font-medium uppercase tracking-[1.5px] text-[#aaaaaa]">
          signature verification
        </p>
        <h1 className="text-[40px] font-black leading-[1] tracking-[-1.8px]">
          {isVerified ? "your signature is counted" : "verification failed"}
        </h1>
        <p className="text-[16px] leading-[1.6] tracking-[-0.3px] text-[#666666]">
          {isVerified &&
            "Thanks for verifying your email. Your signature now counts toward the petition."}
          {status === "missing" &&
            "This verification link is missing a token. Please use the link from your email."}
          {status === "invalid" &&
            "This verification link is invalid or has already been used."}
          {status === "expired" &&
            "This verification link has expired. Please sign again to receive a new verification email."}
        </p>
        <Link
          className="inline-flex rounded-lg bg-black px-5 py-3 text-[14px] font-bold tracking-[-0.2px] text-white transition hover:opacity-80"
          href="/"
        >
          back to petition
        </Link>
      </div>
    </main>
  );
}
