"use client";

import React, { useState } from "react";
import Script from "next/script";
import { addSignature } from "@/app/actions";
import type { Supporter } from "./SupporterCard";

interface PetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSupporter: Supporter) => void;
}

declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
    };
  }
}

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function PetitionModal({
  isOpen,
  onClose,
  onSuccess,
}: PetitionModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const turnstileToken = formData.get("cf-turnstile-response")?.toString();

    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete verification.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await addSignature(name, reason, email, turnstileToken);
      if (res.success && res.signature) {
        onSuccess(res.signature);
        setName("");
        setEmail("");
        setReason("");
        onClose();
      } else {
        setError(res.error || "something went wrong.");
        window.turnstile?.reset();
      }
    } catch (err) {
      console.error(err);
      setError("something went wrong. try again.");
      window.turnstile?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      {turnstileSiteKey && (
        <Script
          async
          defer
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}

      <div
        className="w-full max-w-[420px] bg-white rounded-xl overflow-hidden animate-fade-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-0 flex items-center justify-between">
          <h3 className="text-[15px] font-black tracking-[-0.5px] text-black">
            sign the petition
          </h3>
          <button
            onClick={onClose}
            className="text-[#cccccc] hover:text-black transition text-[20px] leading-none cursor-pointer"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

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
              onChange={(event) => setName(event.target.value)}
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[15px] tracking-[-0.3px] text-black placeholder-[#bbbbbb] focus:outline-none focus:border-[#999999] transition"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="modal-email"
              className="text-[12px] tracking-[1px] uppercase text-[#aaaaaa] font-medium"
            >
              email for duplicate check
            </label>
            <input
              type="email"
              id="modal-email"
              placeholder="used only to prevent duplicate signatures"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[15px] tracking-[-0.3px] text-black placeholder-[#bbbbbb] focus:outline-none focus:border-[#999999] transition"
              disabled={isSubmitting}
              required
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
              placeholder="optional - share your perspective"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[15px] tracking-[-0.3px] text-black placeholder-[#bbbbbb] focus:outline-none focus:border-[#999999] transition resize-none"
              disabled={isSubmitting}
            />
          </div>

          {turnstileSiteKey && (
            <div className="min-h-[65px]">
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-theme="light"
              />
            </div>
          )}

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
            your email is only used to prevent duplicate signatures. we do not
            send email, share it, or show it publicly.
          </p>
        </form>
      </div>
    </div>
  );
}
