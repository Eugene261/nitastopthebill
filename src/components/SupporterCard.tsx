"use client";

import React, { useEffect, useState } from "react";

export interface Supporter {
  id: string;
  name: string;
  reason: string | null;
  createdAt: string;
}

interface SupporterCardProps {
  supporter: Supporter;
}

interface RelativeTimeProps {
  className?: string;
  dateString: string;
  prefix?: string;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return "a few seconds ago";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function RelativeTime({
  className,
  dateString,
  prefix,
}: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState<string | null>(null);

  useEffect(() => {
    const updateRelativeTime = () => {
      setRelativeTime(formatRelativeTime(dateString));
    };

    updateRelativeTime();
    const intervalId = window.setInterval(updateRelativeTime, 60000);

    return () => window.clearInterval(intervalId);
  }, [dateString]);

  return (
    <p className={className}>
      {prefix}
      {relativeTime ? `${prefix ? " - " : ""}${relativeTime}` : ""}
      {!prefix && !relativeTime ? "recently" : ""}
    </p>
  );
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

export default function SupporterCard({ supporter }: SupporterCardProps) {
  const initials = getInitials(supporter.name);

  return (
    <div className="flex gap-4 py-5 border-b border-[#f0f0f0] last:border-b-0 animate-fade-up">
      <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-[#999999] select-none">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[15px] tracking-[-0.3px] text-black truncate">
            {supporter.name}
          </span>
        </div>
        <RelativeTime
          className="text-[13px] tracking-[-0.3px] text-[#aaaaaa] mt-0.5"
          dateString={supporter.createdAt}
          prefix="signed"
        />
        {supporter.reason && (
          <p className="text-[14px] tracking-[-0.3px] text-[#666666] leading-[1.5] mt-2">
            {supporter.reason}
          </p>
        )}
      </div>
    </div>
  );
}
