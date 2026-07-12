import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Blackletter Lab",
  description: "Your private legaltech idea lab.",
};

export default function HomePage() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  return <LandingPage />;
}
