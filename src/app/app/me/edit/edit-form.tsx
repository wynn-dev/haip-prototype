"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { saveProfile } from "@/app/actions/profile";
import { AboutSection, HousematesSection, LifestyleSection, ListingSection, RoleSection, TenantHousingSection } from "@/components/profile/sections";
import { Button } from "@/components/ui/button";
import type { ProfileInput } from "@/lib/profile-schema";

export function EditForm({ initial }: { initial: ProfileInput }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [pending, start] = useTransition();
  const set = (patch: Partial<ProfileInput>) => setP((c) => ({ ...c, ...patch }));
  const sections = [
    ["I am…", RoleSection],
    ["The basics", AboutSection],
    [p.role === "renter" ? "Your place" : "What you're after", p.role === "renter" ? ListingSection : TenantHousingSection],
    ["Who you'd live with", HousematesSection],
    ["How you live", LifestyleSection],
  ] as const;

  return (
    <main className="flex flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-ink bg-paper px-4 py-3">
        <Link href="/app/me" aria-label="Back"><ArrowLeft className="size-5" /></Link>
        <h1 className="font-display text-xl font-extrabold">Edit profile</h1>
        <Button
          variant="oranje"
          className="ml-auto h-9 px-4"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await saveProfile(p);
              if (r.error) return void toast.error(r.error);
              toast.success("Saved. Your deck is updated.");
              router.push("/app/me");
            })
          }
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </header>
      <div className="flex flex-col gap-10 px-5 py-6">
        {sections.map(([title, Comp]) => (
          <section key={title}>
            <h2 className="mb-4 font-display text-2xl font-extrabold">{title}</h2>
            <Comp p={p} set={set} />
          </section>
        ))}
      </div>
    </main>
  );
}
