import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { VerifyForm } from "./verify-form";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.stage === "full") redirect("/app");
  const { demo } = await searchParams;
  return <VerifyForm demoCode={demo ?? null} />;
}
