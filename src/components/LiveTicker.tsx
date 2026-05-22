import React from "react";
import { Supporter, formatRelativeTime } from "./SupporterCard";

interface LiveTickerProps {
  signatures: Supporter[];
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
          const initials = sig.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "A";

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
                <p className="text-[11px] tracking-[-0.3px] text-[#bbbbbb]">
                  {formatRelativeTime(sig.createdAt)}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
