"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "./actions";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await adminLogin(password);
      if (result.success) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(result.error ?? "Invalid password.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("something went wrong. try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] space-y-5 rounded-xl border border-[#eeeeee] bg-[#fafafa] p-6 animate-fade-up"
      >
        <div>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[1.5px] text-[#aaaaaa]">
            petition admin
          </p>
          <h1 className="text-[24px] font-black leading-[1.1] tracking-[-1px]">
            sign in to continue
          </h1>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="admin-password"
            className="text-[12px] tracking-[1px] uppercase text-[#aaaaaa] font-medium"
          >
            password
          </label>
          <input
            type="password"
            id="admin-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-lg text-[15px] tracking-[-0.3px] text-black placeholder-[#bbbbbb] focus:outline-none focus:border-[#999999] transition"
            disabled={isSubmitting}
            autoFocus
            required
          />
        </div>

        {error && (
          <p className="text-[13px] text-red-500 tracking-[-0.3px]">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-black text-white text-[15px] font-bold tracking-[-0.3px] rounded-lg transition-opacity duration-300 hover:opacity-80 disabled:opacity-50 disabled:cursor-default cursor-pointer"
        >
          {isSubmitting ? "verifying..." : "sign in"}
        </button>
      </form>
    </main>
  );
}
