"use client";

import React, { useMemo, useState } from "react";
import type { Supporter } from "./SupporterCard";

type FilterMode = "all" | "comments" | "named" | "anonymous";

interface AdminDashboardProps {
  errorCode: string | null;
  generatedAt: string;
  isPasswordConfigured: boolean;
  signatures: Supporter[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function csvCell(value: string | null) {
  return `"${(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(signatures: Supporter[]) {
  const rows = [
    ["id", "name", "comment", "signed_at"],
    ...signatures.map((signature) => [
      signature.id,
      signature.name,
      signature.reason ?? "",
      signature.createdAt,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => csvCell(value)).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `nita-petition-signatures-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildMailDraft(signatures: Supporter[]) {
  const total = signatures.length.toLocaleString();
  const withComments = signatures.filter((signature) => signature.reason).length;
  const comments = signatures
    .filter((signature) => signature.reason)
    .slice(0, 15)
    .map(
      (signature, index) =>
        `${index + 1}. ${signature.name}: ${signature.reason}`,
    )
    .join("\n");

  return [
    "Subject: Petition against the NITA Bill 2025",
    "",
    "Dear NITA leadership,",
    "",
    `We are submitting a public petition with ${total} signatures opposing the NITA Bill 2025 in its current form.`,
    "",
    "The concern from Ghana's technology community is that mandatory licensing for developers, designers, IT workers, freelancers, students, and self-taught builders would add unnecessary barriers to participation in the digital economy.",
    "",
    `At the time of export, ${withComments.toLocaleString()} signers also submitted written comments explaining their concerns.`,
    "",
    "Requested action:",
    "- Pause or withdraw the bill in its current form.",
    "- Publish a clear public consultation process with developers, designers, startups, training hubs, freelancers, students, civil society, and employers.",
    "- Ensure any regulation targets real public-interest risks without blocking self-taught talent, remote work, startups, or open digital participation.",
    "",
    "Selected signer comments:",
    comments || "No written comments were submitted yet.",
    "",
    "The full signatures export is attached as a CSV.",
    "",
    "Regards,",
    "Stop the NITA Bill petition organizers",
  ].join("\n");
}

export default function AdminDashboard({
  errorCode,
  generatedAt,
  isPasswordConfigured,
  signatures,
}: AdminDashboardProps) {
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const generatedTime = new Date(generatedAt).getTime();
    const day = 24 * 60 * 60 * 1000;

    return {
      total: signatures.length,
      withComments: signatures.filter((signature) => signature.reason).length,
      anonymous: signatures.filter((signature) =>
        signature.name.toLowerCase().includes("anonymous"),
      ).length,
      last24h: signatures.filter(
        (signature) =>
          generatedTime - new Date(signature.createdAt).getTime() <= day,
      ).length,
    };
  }, [generatedAt, signatures]);

  const filteredSignatures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return signatures.filter((signature) => {
      const hasComment = Boolean(signature.reason);
      const isAnonymous = signature.name.toLowerCase().includes("anonymous");
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "comments" && hasComment) ||
        (filterMode === "named" && !isAnonymous) ||
        (filterMode === "anonymous" && isAnonymous);

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [signature.name, signature.reason ?? "", signature.createdAt]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [filterMode, query, signatures]);

  const mailDraft = useMemo(() => buildMailDraft(signatures), [signatures]);

  const handleCopyDraft = async () => {
    await navigator.clipboard.writeText(mailDraft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1180px] space-y-8">
        <header className="flex flex-col gap-5 border-b border-[#eeeeee] pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[12px] font-medium uppercase tracking-[1.5px] text-[#aaaaaa]">
              petition admin
            </p>
            <h1 className="text-[32px] font-black leading-[1] tracking-[-1.6px] sm:text-[44px]">
              signatures and submission package
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadCsv(signatures)}
              className="rounded-lg border border-black px-4 py-2.5 text-[13px] font-bold tracking-[-0.2px] transition hover:bg-black hover:text-white"
              type="button"
            >
              export csv
            </button>
            <button
              onClick={handleCopyDraft}
              className="rounded-lg bg-black px-4 py-2.5 text-[13px] font-bold tracking-[-0.2px] text-white transition hover:opacity-80"
              type="button"
            >
              {copied ? "draft copied" : "copy mail draft"}
            </button>
          </div>
        </header>

        {!isPasswordConfigured && (
          <div className="rounded-lg border border-[#f0d8a8] bg-[#fff9ea] px-4 py-3 text-[13px] leading-[1.5] text-[#775500]">
            Set ADMIN_PASSWORD in .env before deployment. In development this
            page is open so you can work locally.
          </div>
        )}

        {errorCode && (
          <div className="rounded-lg border border-[#ffd5d5] bg-[#fff5f5] px-4 py-3 text-[13px] leading-[1.5] text-[#c1121f]">
            Could not load signatures from the database. Error code: {errorCode}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatPanel label="total signatures" value={stats.total} />
          <StatPanel label="with comments" value={stats.withComments} />
          <StatPanel label="anonymous" value={stats.anonymous} />
          <StatPanel label="last 24 hours" value={stats.last24h} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-[#eeeeee] bg-[#fafafa] p-4 sm:flex-row sm:items-center">
              <input
                aria-label="Search signatures"
                className="min-h-11 flex-1 rounded-lg border border-[#e0e0e0] bg-white px-3 text-[14px] tracking-[-0.2px] outline-none transition focus:border-[#999999]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="search names, comments, dates"
                type="search"
                value={query}
              />
              <select
                aria-label="Filter signatures"
                className="min-h-11 rounded-lg border border-[#e0e0e0] bg-white px-3 text-[14px] tracking-[-0.2px] outline-none transition focus:border-[#999999]"
                onChange={(event) =>
                  setFilterMode(event.target.value as FilterMode)
                }
                value={filterMode}
              >
                <option value="all">all signatures</option>
                <option value="comments">comments only</option>
                <option value="named">named only</option>
                <option value="anonymous">anonymous only</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#eeeeee]">
              <div className="grid grid-cols-[1fr_120px] gap-4 border-b border-[#eeeeee] bg-[#fafafa] px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-[#aaaaaa] sm:grid-cols-[180px_1fr_150px]">
                <span>name</span>
                <span className="hidden sm:block">comment</span>
                <span>signed</span>
              </div>

              <div className="max-h-[720px] overflow-y-auto">
                {filteredSignatures.length === 0 ? (
                  <p className="px-4 py-10 text-center text-[14px] tracking-[-0.2px] text-[#888888]">
                    no signatures match this view
                  </p>
                ) : (
                  filteredSignatures.map((signature) => (
                    <div
                      className="grid grid-cols-[1fr_120px] gap-4 border-b border-[#f2f2f2] px-4 py-4 last:border-b-0 sm:grid-cols-[180px_1fr_150px]"
                      key={signature.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold tracking-[-0.3px]">
                          {signature.name}
                        </p>
                        <p className="mt-1 truncate text-[12px] tracking-[-0.2px] text-[#aaaaaa] sm:hidden">
                          {signature.reason || "no comment"}
                        </p>
                      </div>
                      <p className="hidden text-[13px] leading-[1.45] tracking-[-0.2px] text-[#666666] sm:block">
                        {signature.reason || "no comment"}
                      </p>
                      <p className="text-[12px] leading-[1.4] tracking-[-0.2px] text-[#888888]">
                        {formatDate(signature.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-5">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[1px] text-[#aaaaaa]">
                submission draft
              </p>
              <textarea
                className="h-[420px] w-full resize-none rounded-lg border border-[#e0e0e0] bg-white p-3 text-[12px] leading-[1.5] tracking-[-0.1px] text-[#333333] outline-none focus:border-[#999999]"
                readOnly
                value={mailDraft}
              />
            </div>

            <div className="rounded-lg border border-[#eeeeee] p-5">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[1px] text-[#aaaaaa]">
                package checklist
              </p>
              <ul className="space-y-2 text-[13px] leading-[1.5] tracking-[-0.2px] text-[#555555]">
                <li>1. Export the CSV after reviewing comments.</li>
                <li>2. Copy the petition draft into your email client.</li>
                <li>3. Attach the exported CSV.</li>
                <li>4. Add the confirmed NITA recipient address.</li>
                <li>5. Send only after final review.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatPanel({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-5">
      <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#aaaaaa]">
        {label}
      </p>
      <p className="mt-3 text-[32px] font-black leading-none tracking-[-1.4px]">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
