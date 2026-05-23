import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "admin login - stop the nita bill",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
