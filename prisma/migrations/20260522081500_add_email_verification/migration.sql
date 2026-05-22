-- AlterTable
ALTER TABLE "Signature" ADD COLUMN "emailHash" TEXT;
ALTER TABLE "Signature" ADD COLUMN "verificationTokenHash" TEXT;
ALTER TABLE "Signature" ADD COLUMN "verificationExpiresAt" TIMESTAMP(3);
ALTER TABLE "Signature" ADD COLUMN "verifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Signature_emailHash_key" ON "Signature"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "Signature_verificationTokenHash_key" ON "Signature"("verificationTokenHash");
