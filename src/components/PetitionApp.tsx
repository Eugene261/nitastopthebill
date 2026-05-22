"use client";

import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import SupporterCard, { Supporter } from "./SupporterCard";
import LiveTicker from "./LiveTicker";
import PetitionModal from "./PetitionModal";

interface PetitionAppProps {
  initialCount: number;
  initialSignatures: Supporter[];
}

const GHANA_CITIES = [
  "Accra",
  "Kumasi",
  "Tema",
  "Takoradi",
  "Cape Coast",
  "Tamale",
  "Koforidua",
  "Ho",
  "Sunyani",
  "Legon",
];

const SIMULATED_POOL = [
  {
    name: "Abena Bonsu",
    reason:
      "This bill will cripple young freelancers in Ghana who rely on international remote work.",
  },
  {
    name: "Kwame Appiah",
    reason:
      "We need policies that encourage startups, not policies that license developers like electricians.",
  },
  {
    name: "Selorm Gavor",
    reason:
      "I work remotely for a US company. If I need a government license to write code, they will just hire from another country.",
  },
  {
    name: "Mawuli Klutse",
    reason:
      "This bill overlaps with the Cyber Security Authority. Let's not build another redundant regulatory empire.",
  },
  {
    name: "Farida Tetteh",
    reason:
      "Coding is self-taught. You cannot certify passion and curiosity. Stop this bill!",
  },
  {
    name: "Ekow Yankah",
    reason:
      "This will destroy the gig economy for young university students who code to pay their tuition.",
  },
  {
    name: "Benedicta Agyei",
    reason:
      "Who drafts these bills? We need to consult the actual developers, designers, and creators first.",
  },
  {
    name: "Nii Odoi",
    reason:
      "Protect our digital space. Keep it open, competitive, and free of unnecessary government bottlenecks.",
  },
  {
    name: "Araba Mensah",
    reason:
      "The tech industry in Ghana has thrived because it's unregulated. Regulation only brings corruption and delays.",
  },
  {
    name: "Yao Dzisah",
    reason: "This bill is anti-innovation. Please let us build in peace.",
  },
  {
    name: "Esi Murphy",
    reason:
      "I am a self-taught UI/UX designer. Will NITA require me to sit an exam to draw wireframes?",
  },
  {
    name: "Paa Kwesi",
    reason:
      "This is a major step backward for Ghana's digitalization agenda.",
  },
  {
    name: "Adjoa Boateng",
    reason:
      "We want to be the Gateway to Africa for tech. This bill is locking the gate.",
  },
  {
    name: "Jojo Quansah",
    reason:
      "Our startup is already struggling with taxes, now we have to pay license fees for coding?",
  },
  {
    name: "Fati Ibrahim",
    reason:
      "This will completely slow down tech training programs. Support tech hubs, don't tax them!",
  },
];

export default function PetitionApp({
  initialCount,
  initialSignatures,
}: PetitionAppProps) {
  const [signatures, setSignatures] =
    useState<Supporter[]>(initialSignatures);
  const [count, setCount] = useState(initialCount);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const signed = localStorage.getItem("nita_petition_signed");
    if (signed) setHasSigned(true);
  }, []);

  // Background simulation
  useEffect(() => {
    const triggerSimulation = () => {
      const template =
        SIMULATED_POOL[Math.floor(Math.random() * SIMULATED_POOL.length)];
      const city =
        GHANA_CITIES[Math.floor(Math.random() * GHANA_CITIES.length)];

      const newSimulated: Supporter = {
        id: `sim-${Math.random().toString(36).substr(2, 9)}`,
        name: `${template.name} (${city})`,
        reason: Math.random() > 0.3 ? template.reason : null,
        createdAt: new Date().toISOString(),
      };

      setSignatures((prev) => [newSimulated, ...prev]);
      setCount((prev) => prev + 1);
    };

    const intervalTime = 15000 + Math.random() * 15000;
    const intervalId = setInterval(triggerSimulation, intervalTime);
    return () => clearInterval(intervalId);
  }, []);

  const handleSignSuccess = (newSupporter: Supporter) => {
    setSignatures((prev) => [newSupporter, ...prev]);
    setCount((prev) => prev + 1);
    setHasSigned(true);
    localStorage.setItem("nita_petition_signed", "true");
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

              <h1 className="mb-6 text-[40px] font-black leading-[1.05] tracking-[-2.2px] text-black sm:text-[56px]">
                imagine i needed a<br />
                certification to
                <br />
                build this.
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
                  ✓ signed
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
                  ✓ signed
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

      {/* ─── FOOTER ─── */}
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
