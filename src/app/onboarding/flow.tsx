"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { saveProfile } from "@/app/actions/profile";
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
import { cn } from "@/lib/utils";

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
    { key: "role", title: "First things first", sub: "Which one are you?", Comp: RoleSection, check: (p) => (p.role ? null : "Pick one") },
    { key: "about", title: "The basics", sub: "Everything here is visible on your card.", Comp: AboutSection, check: (p) => (p.username.trim().length < 2 ? "Add a username" : !p.gender ? "Pick a gender" : !p.languages.length ? "Add a language" : null) },
    { key: "life", title: "How you live", sub: "Be honest, it's how we avoid dish wars.", Comp: LifestyleSection },
    { key: "mates", title: "Who you'd live with", sub: "Used to filter who you see, both ways.", Comp: HousematesSection },
    p.role === "renter"
      ? { key: "place", title: "Your place", sub: "Tenants see this on your card.", Comp: ListingSection, check: (p) => { const l = p.listing; return !l?.title ? "Add a title" : !l.city ? "Pick a city" : !l.address ? "Add the address" : null; } }
      : { key: "hunt", title: "What you're after", sub: "Budget, cities and timing.", Comp: TenantHousingSection, check: (p) => (!p.areas?.length ? "Pick at least one city" : null) },
    { key: "verify", title: "Trust & safety", sub: "Verified people get more matches.", Comp: () => <VerifySection state={verify} /> },
  ];
  const step = steps[i];
  const last = i === steps.length - 1;

  const next = () => {
    const err = step.check?.(p);
    if (err) return toast.error(err);
    if (!last) {
      setDir(1);
      setI(i + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    start(async () => {
      const r = await saveProfile(p, { finish: true });
      if (r.error) return void toast.error(r.error);
      toast.success("You're in! Happy swiping 🏡");
      router.push("/app");
    });
  };

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 bg-paper/90 px-5 pt-5 pb-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setDir(-1); setI(Math.max(0, i - 1)); }} disabled={i === 0} className="grid size-9 place-items-center rounded-full border-[1.5px] border-ink disabled:opacity-0" aria-label="Back">
            <ArrowLeft className="size-4" />
          </button>
          {/* tram-line progress */}
          <div className="relative flex flex-1 items-center justify-between">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink/15" />
            <div className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-oranje transition-all duration-500" style={{ width: `${(i / (steps.length - 1)) * 100}%` }} />
            {steps.map((s, k) => (
              <span key={s.key} className={cn("relative size-3.5 rounded-full border-2 border-ink transition-colors", k <= i ? "bg-oranje" : "bg-paper")} />
            ))}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.section
          key={step.key}
          custom={dir}
          initial={{ opacity: 0, x: 40 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 * dir }}
          transition={{ duration: 0.22 }}
          className="flex-1 px-5 pt-3 pb-6"
        >
          <p className="font-mono text-xs text-muted-foreground">STEP {i + 1}/{steps.length}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">{step.title}</h1>
          <p className="mb-6 text-sm text-muted-foreground">{step.sub}</p>
          <step.Comp p={p} set={set} />
        </motion.section>
      </AnimatePresence>

      <div className="sticky bottom-0 bg-gradient-to-t from-paper via-paper to-transparent px-5 pt-6 pb-safe">
        <Button variant={last ? "oranje" : "ink"} size="xl" className="mb-3 w-full" onClick={next} disabled={pending}>
          {pending ? "Saving…" : last ? (verify.ageVerified ? "Start swiping →" : "Verify age to continue") : "Next"}
        </Button>
      </div>
    </main>
  );
}
