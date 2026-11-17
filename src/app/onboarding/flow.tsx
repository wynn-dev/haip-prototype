"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { saveProfile } from "@/app/actions/profile";
import { BottomBar } from "@/components/ios";
import {
  AboutSection,
  HousematesSection,
  LifestyleSection,
  ListingSection,
  RoleSection,
  TenantHousingSection,
  type SectionProps,
} from "@/components/profile/sections";
import { VerifySection, type VerifyState } from "@/components/profile/verify-section";
import { Button } from "@/components/ui/button";
import type { ProfileInput } from "@/lib/profile-schema";

type Step = {
  key: string;
  title: string;
  sub: string;
  Comp: (p: SectionProps) => React.ReactNode;
  check?: (p: ProfileInput) => string | null;
};

export function OnboardingFlow({ initial, verify }: { initial: ProfileInput; verify: VerifyState }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [pending, start] = useTransition();
  const set = (patch: Partial<ProfileInput>) => setP((cur) => ({ ...cur, ...patch }));

  const steps: Step[] = [
    { key: "role", title: "What brings you here?", sub: "You can change this later.", Comp: RoleSection, check: (p) => (p.role ? null : "Choose one to continue") },
    { key: "about", title: "Your profile", sub: "This is what other people see.", Comp: AboutSection, check: (p) => (p.username.trim().length < 2 ? "Add a username" : !p.gender ? "Choose a gender" : !p.languages.length ? "Add a language" : null) },
    { key: "life", title: "How you live", sub: "Used to rank who you see first.", Comp: LifestyleSection },
    { key: "mates", title: "Who you'd live with", sub: "Filters work both ways.", Comp: HousematesSection },
    p.role === "renter"
      ? { key: "place", title: "Your place", sub: "Shown on your card to people looking for a room.", Comp: ListingSection, check: (p) => { const l = p.listing; return !l?.title ? "Add a title" : !l.city ? "Choose a city" : !l.address ? "Add the street address" : null; } }
      : { key: "hunt", title: "What you're looking for", sub: "Budget, cities and timing.", Comp: TenantHousingSection, check: (p) => (!p.areas?.length ? "Choose at least one city" : null) },
    { key: "verify", title: "Verification", sub: "Verified people get more matches.", Comp: () => <VerifySection state={verify} /> },
  ];
  const step = steps[i];
  const last = i === steps.length - 1;

  const go = (d: number) => {
    setDir(d);
    setI((x) => Math.max(0, Math.min(steps.length - 1, x + d)));
    document.getElementById("app")?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    const err = step.check?.(p);
    if (err) return void toast.error(err);
    if (!last) return go(1);
    start(async () => {
      const r = await saveProfile(p, { finish: true });
      if (r.error) return void toast.error(r.error);
      router.push("/app");
    });
  };

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-xl">
        <div className="grid h-11 grid-cols-[1fr_auto_1fr] items-center px-4">
          <button type="button" onClick={() => go(-1)} className="flex items-center justify-self-start text-tint disabled:invisible" disabled={i === 0}>
            <ChevronLeft className="-ml-1.5 size-7" strokeWidth={2.2} /> Back
          </button>
          <span className="text-[15px] text-label-2 tabular-nums">{i + 1} of {steps.length}</span>
          <span />
        </div>
        <div className="h-[3px] bg-fill">
          <div className="h-full bg-tint transition-all duration-500" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.section
          key={step.key}
          initial={{ opacity: 0, x: 24 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 * dir }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 pb-8"
        >
          <div className="px-4 pt-5 pb-6">
            <h1 className="text-[28px] leading-tight font-bold tracking-[-0.03em]">{step.title}</h1>
            <p className="mt-1 text-[15px] text-label-2">{step.sub}</p>
          </div>
          <step.Comp p={p} set={set} />
        </motion.section>
      </AnimatePresence>

      <BottomBar>
        <Button variant="filled" size="xl" className="w-full" onClick={next} disabled={pending || (last && !verify.ageVerified)}>
          {pending ? "Saving…" : last ? "Start browsing" : "Continue"}
        </Button>
        {last && !verify.ageVerified && <p className="pt-2 text-center text-[13px] text-label-2">Complete the age check to continue.</p>}
      </BottomBar>
    </main>
  );
}
