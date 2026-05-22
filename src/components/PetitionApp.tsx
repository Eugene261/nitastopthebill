"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import ProgressBar from "./ProgressBar";
import SupporterCard, { Supporter } from "./SupporterCard";
import LiveTicker from "./LiveTicker";
import PetitionModal from "./PetitionModal";
import { getSignatureCount, getSignatures } from "@/app/actions";

interface PetitionAppProps {
  initialCount: number;
  initialSignatures: Supporter[];
}

const signedStorageKey = "nita_petition_signed";
const signedStorageChangedEvent = "nita_petition_signed_changed";

function subscribeToSignedStatus(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === signedStorageKey) {
      onStoreChange();
    }
  };

  const handleLocalChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(signedStorageChangedEvent, handleLocalChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(signedStorageChangedEvent, handleLocalChange);
  };
}

function getSignedSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(signedStorageKey) === "true";
}

export default function PetitionApp({
  initialCount,
  initialSignatures,
}: PetitionAppProps) {
  const [signatures, setSignatures] =
    useState<Supporter[]>(initialSignatures);
  const [count, setCount] = useState(initialCount);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasSigned = useSyncExternalStore(
    subscribeToSignedStatus,
    getSignedSnapshot,
    () => false,
  );
  const [shareCopied, setShareCopied] = useState(false);
  const [colorOffset, setColorOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorOffset((prev) => (prev + 1) % 3);
    }, 2500); // changes colors every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  const ghanaColors = [
    "#CE1126", // Red
    "#D9A200", // Warm Gold/Yellow (darker for excellent readability on white)
    "#006B3F", // Green
  ];

  const getColor = (index: number) => {
    return ghanaColors[(index + colorOffset) % 3];
  };

  // Poll for new real signatures every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const [latestCount, latestSignatures] = await Promise.all([
          getSignatureCount(),
          getSignatures(100),
        ]);
        setCount(latestCount);
        setSignatures(latestSignatures);
      } catch (err) {
        console.error("Failed to poll signatures:", err);
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleSignSuccess = (newSupporter: Supporter) => {
    setSignatures((prev) => [newSupporter, ...prev]);
    setCount((prev) => prev + 1);
    localStorage.setItem(signedStorageKey, "true");
    window.dispatchEvent(new Event(signedStorageChangedEvent));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "stop the nita bill",
          text: "the people we put in power are the same exact people that goes against us. sign the petition.",
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[1024px] px-6 pt-12 pb-20 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Hero, Mobile Progress & Actions, Quotes, Supporters Feed */}
          <div className="space-y-12 sm:space-y-16">
            
            {/* Hero Header */}
            <div className="text-left animate-fade-in">
              <p className="mb-5 text-[13px] uppercase tracking-[1.5px] text-[#aaaaaa]">
                petition against the nita bill 2025
              </p>

              <h1 className="mb-6 text-[40px] font-black leading-[1.05] tracking-[-2.2px] sm:text-[56px]">
                <span
                  className="block transition-colors duration-1000"
                  style={{ color: getColor(0), transition: "color 1000ms ease-in-out" }}
                >
                  imagine i needed a
                </span>
                <span
                  className="block transition-colors duration-1000"
                  style={{ color: getColor(1), transition: "color 1000ms ease-in-out" }}
                >
                  certification to
                </span>
                <span
                  className="block transition-colors duration-1000"
                  style={{ color: getColor(2), transition: "color 1000ms ease-in-out" }}
                >
                  build this.
                </span>
              </h1>

              <p className="mb-0 max-w-[480px] text-[15px] leading-[1.6] tracking-[-0.3px] text-[#888888] sm:text-[17px]">
                the people we put in power are the same exact people that goes
                against us. the NITA Bill 2025 wants to force every developer,
                designer, and IT professional in Ghana to get a government license
                just to work. we say no.
              </p>
            </div>

            {/* Mobile-only Progress & Sign (Visible < lg) */}
            <div className="block lg:hidden rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-6 space-y-5 animate-fade-up">
              <ProgressBar count={count} />

              {hasSigned ? (
                <div className="w-full text-center py-3 rounded-lg bg-white border border-[#e0e0e0] text-[13px] tracking-[-0.3px] text-[#888888]">
                  signed
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 bg-black text-white text-[15px] font-bold tracking-[-0.3px] rounded-lg transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                >
                  sign
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full py-3 border border-[#e0e0e0] bg-white text-[15px] tracking-[-0.3px] text-black rounded-lg transition-colors hover:border-[#999999] cursor-pointer"
              >
                {shareCopied ? "copied!" : "share"}
              </button>
            </div>

            {/* Quotes section */}
            <div className="grid gap-3 sm:grid-cols-2 animate-fade-up">
              <div className="rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-[14px] tracking-[-0.3px] text-[#888888] sm:text-[15px]">
                &quot;i shouldn&apos;t need a government license to push code to
                github.&quot;
              </div>
              <div className="rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-[14px] tracking-[-0.3px] text-[#888888] sm:text-[15px]">
                &quot;they want to regulate an industry they don&apos;t
                understand.&quot;
              </div>
              <div className="rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-[14px] tracking-[-0.3px] text-[#888888] sm:text-[15px]">
                &quot;self-taught developers built the internet. certification
                didn&apos;t.&quot;
              </div>
              <div className="rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-[14px] tracking-[-0.3px] text-[#888888] sm:text-[15px]">
                &quot;this bill will push the best talent out of ghana.&quot;
              </div>
            </div>

            {/* Feed Section */}
            <div className="animate-fade-up">
              <p className="mb-6 text-[13px] uppercase tracking-[1.5px] text-[#aaaaaa]">
                recent supporters
              </p>
              <div>
                {signatures.map((sig) => (
                  <SupporterCard key={sig.id} supporter={sig} />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar starting from top (next to Hero on desktop) */}
          <div className="lg:sticky lg:top-16 space-y-8 w-full animate-fade-in">
            
            {/* Desktop Progress Card (Visible lg) */}
            <div className="hidden lg:block rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-6 space-y-5">
              <ProgressBar count={count} />

              {hasSigned ? (
                <div className="w-full text-center py-3 rounded-lg bg-white border border-[#e0e0e0] text-[13px] tracking-[-0.3px] text-[#888888]">
                  signed
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 bg-black text-white text-[15px] font-bold tracking-[-0.3px] rounded-lg transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                >
                  sign
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full py-3 border border-[#e0e0e0] bg-white text-[15px] tracking-[-0.3px] text-black rounded-lg transition-colors hover:border-[#999999] cursor-pointer"
              >
                {shareCopied ? "copied!" : "share"}
              </button>
            </div>

            {/* Live Ticker (Visible on lg or stacks at bottom on mobile) */}
            <div className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-5">
              <p className="mb-4 text-[11px] uppercase tracking-[1px] text-[#aaaaaa]">
                live signatures
              </p>
              <LiveTicker signatures={signatures} />
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="pb-10 text-center space-y-2">
        <p className="text-[13px] tracking-[-0.3px] text-[#888888]">
          built with frustration and love for ghana&apos;s tech ecosystem
        </p>
        <p className="text-[13px] tracking-[-0.3px] text-[#bbbbbb]">
          <a
            href="https://nita.gov.gh"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-black"
          >
            read the bill
          </a>
        </p>
      </footer>

      {/* Modal */}
      <PetitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSignSuccess}
      />
    </div>
  );
}
