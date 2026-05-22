import React from "react";

export interface Supporter {
  id: string;
  name: string;
  reason: string | null;
  createdAt: string;
}

interface SupporterCardProps {
  supporter: Supporter;
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

export default function SupporterCard({ supporter }: SupporterCardProps) {
  const initials = supporter.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  return (
    <div className="flex gap-4 py-5 border-b border-[#f0f0f0] last:border-b-0 animate-fade-up">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-[#999999] select-none">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[15px] tracking-[-0.3px] text-black truncate">
            {supporter.name}
          </span>
        </div>
        <p className="text-[13px] tracking-[-0.3px] text-[#aaaaaa] mt-0.5">
          signed · {formatRelativeTime(supporter.createdAt)}
        </p>
        {supporter.reason && (
          <p className="text-[14px] tracking-[-0.3px] text-[#666666] leading-[1.5] mt-2">
            {supporter.reason}
          </p>
        )}
      </div>
    </div>
  );
}
