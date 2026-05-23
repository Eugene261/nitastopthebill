"use server";

import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  constantTimeEqual,
  createAdminSessionValue,
} from "@/lib/adminSession";

async function setSessionCookie() {
  const value = await createAdminSessionValue();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function adminLogin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Admin is not configured." };
    }
    await setSessionCookie();
    return { success: true };
  }

  if (!constantTimeEqual(password, adminPassword)) {
    return { success: false, error: "Invalid password." };
  }

  await setSessionCookie();
  return { success: true };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return { success: true };
}
