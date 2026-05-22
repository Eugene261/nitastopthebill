import React from "react";

interface ProgressBarProps {
  count: number;
  goal?: number;
}

export default function ProgressBar({ count, goal = 10000 }: ProgressBarProps) {
  const percentage = Math.min(Math.round((count / goal) * 100), 100);

  return (
    <div className="space-y-3">
      <p className="text-[13px] tracking-[-0.3px] text-[#aaaaaa]">
        <span className="text-[28px] font-black tracking-[-1.5px] text-black">
          {count.toLocaleString()}
        </span>{" "}
        signed of {goal.toLocaleString()} goal
      </p>

      {/* Track */}
      <div className="w-full bg-[#f0f0f0] h-[6px] rounded-full overflow-hidden">
        <div
          className="bg-black h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
