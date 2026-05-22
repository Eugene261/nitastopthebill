import React from "react";
import PetitionApp from "@/components/PetitionApp";
import { getSignatureCount, getSignatures } from "./actions";

// Force dynamic rendering so that database fetches are always fresh on request
export const dynamic = "force-dynamic";

export default async function Home() {
  const [count, signatures] = await Promise.all([
    getSignatureCount(),
    getSignatures(100),
  ]);

  return <PetitionApp initialCount={count} initialSignatures={signatures} />;
}
