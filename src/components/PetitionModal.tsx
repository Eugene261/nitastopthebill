"use client";

import React, { useState } from "react";
import { addSignature } from "@/app/actions";

interface PetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSupporter: {
    id: string;
    name: string;
    reason: string | null;
    createdAt: string;
  }) => void;
}

export default function PetitionModal({
  isOpen,
  onClose,
  onSuccess,
}: PetitionModalProps) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await addSignature(name, reason);
      if (res.success && res.signature) {
        onSuccess(res.signature);
        setName("");
        setReason("");
        onClose();
      } else {
        setError(res.error || "something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("something went wrong. try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex items-center justify-between">
          <h3 className="text-[15px] font-black tracking-[-0.5px] text-black">
            sign the petition
          </h3>
          <button
            onClick={onClose}
            className="text-[#cccccc] hover:text-black transition text-[20px] leading-none cursor-pointer"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="modal-name"
              className="text-[12px] tracking-[1px] uppercase text-[#aaaaaa] font-medium"
            >
              name / nickname
            </label>
            <input
              type="text"
              id="modal-name"
              placeholder="anonymous is fine too"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[15px] tracking-[-0.3px] text-black placeholder-[#bbbbbb] focus:outline-none focus:border-[#999999] transition"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="modal-reason"
              className="text-[12px] tracking-[1px] uppercase text-[#aaaaaa] font-medium"
            >
              why are you signing?
            </label>
            <textarea
              id="modal-reason"
              rows={3}
              placeholder="optional — share your perspective"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[15px] tracking-[-0.3px] text-black placeholder-[#bbbbbb] focus:outline-none focus:border-[#999999] transition resize-none"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500 tracking-[-0.3px]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-black text-white text-[15px] font-bold tracking-[-0.3px] rounded-lg transition-opacity duration-300 hover:opacity-80 disabled:opacity-50 disabled:cursor-default cursor-pointer"
          >
            {isSubmitting ? "submitting..." : "cast my signature"}
          </button>

          <p className="text-[12px] text-[#bbbbbb] tracking-[-0.2px] text-center leading-[1.5]">
            your voice matters. if you leave name blank, you sign as
            &quot;anonymous supporter.&quot;
          </p>
        </form>
      </div>
    </div>
  );
}
