import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { AppIcon } from "@/components/brand";
import { LegalFooter } from "@/components/legal-footer";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME } from "@/lib/brand";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const POINTS = [
  { icon: SlidersHorizontal, title: "Matched on how you live", body: "Budget, city, contract length, tidiness, sleep schedule and allergies." },
  { icon: MessageCircle, title: "Chat when it's mutual", body: "You can only message people who liked you back." },
  { icon: ShieldCheck, title: "Verified and moderated", body: "Phone 2FA, an 18+ ID check, optional student check, and real people reviewing reports." },
];

export default async function Landing() {
  const s = await getSession();
  if (s?.stage === "full") redirect("/app");

  return (
    <main className="flex flex-1 flex-col bg-surface">
      <div className="flex flex-1 flex-col px-8 pt-14">
        <AppIcon className="size-16" />
        <h1 className="mt-6 text-[34px] leading-[1.1] font-bold tracking-[-0.035em]">
          Find a housemate who lives like you do.
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-label-2">
          {APP_NAME} is for students and renters in the Netherlands looking for a room, a tenant, or someone to hunt with.
        </p>

        <ul className="mt-9 mb-6 flex flex-col gap-5">
          {POINTS.map((p) => (
            <li key={p.title} className="flex gap-4">
              <p.icon className="mt-0.5 size-7 shrink-0 text-tint" strokeWidth={1.75} />
              <div>
                <p className="text-[15px] font-semibold">{p.title}</p>
                <p className="text-[15px] leading-snug text-label-2">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-1 bg-surface/90 px-6 pt-3 backdrop-blur-xl">
        <Link href="/signup" className={cn(buttonVariants({ variant: "filled", size: "xl" }), "w-full")}>
          Create account
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "plain", size: "xl" }), "w-full font-medium")}>
          I already have an account
        </Link>
        <LegalFooter />
      </div>
    </main>
  );
}
