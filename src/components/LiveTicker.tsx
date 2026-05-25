import React from "react";
import { RelativeTime, Supporter } from "./SupporterCard";

interface LiveTickerProps {
  signatures: Supporter[];
}

function getInitials(name: string): string {
  const letters: string[] = [];
  for (const word of name.trim().split(/\s+/)) {
    const match = word.match(/\p{L}/u);
    if (match) letters.push(match[0].toUpperCase());
    if (letters.length >= 2) break;
  }
  return letters.join("") || "A";
}

export default function LiveTicker({ signatures }: LiveTickerProps) {
  const recentSignatures = signatures.slice(0, 6);

  return (
    <div className="space-y-3">
      {recentSignatures.length === 0 ? (
        <p className="text-[13px] text-[#aaaaaa] tracking-[-0.3px]">
          no signatures yet. be the first.
        </p>
      ) : (
        recentSignatures.map((sig) => {
          const initials = getInitials(sig.name);

          return (
            <div
              key={sig.id}
              className="flex items-center gap-3 animate-fade-in"
            >
              <div className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-[#999999] select-none">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold tracking-[-0.3px] text-black truncate">
                  {sig.name}
                </p>
                <RelativeTime
                  className="text-[11px] tracking-[-0.3px] text-[#bbbbbb]"
                  dateString={sig.createdAt}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
