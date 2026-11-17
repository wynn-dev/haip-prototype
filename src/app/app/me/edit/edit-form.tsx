"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveProfile } from "@/app/actions/profile";
import { NavBar } from "@/components/ios";
import { AboutSection, HousematesSection, LifestyleSection, ListingSection, RoleSection, TenantHousingSection } from "@/components/profile/sections";
import type { ProfileInput } from "@/lib/profile-schema";

export function EditForm({ initial }: { initial: ProfileInput }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [pending, start] = useTransition();
  const set = (patch: Partial<ProfileInput>) => setP((c) => ({ ...c, ...patch }));
  const sections = [
    ["I am", RoleSection],
    ["Profile", AboutSection],
    [p.role === "renter" ? "Your place" : "Looking for", p.role === "renter" ? ListingSection : TenantHousingSection],
    ["Housemates", HousematesSection],
    ["Lifestyle", LifestyleSection],
  ] as const;

  return (
    <main className="flex flex-col">
      <NavBar
        back="/app/me"
        backLabel="Profile"
        title="Edit Profile"
        trailing={
          <button
            disabled={pending}
            className="font-semibold text-tint disabled:opacity-40"
            onClick={() =>
              start(async () => {
                const r = await saveProfile(p);
                if (r.error) return void toast.error(r.error);
                toast.success("Saved");
                router.push("/app/me");
              })
            }
          >
            {pending ? "Saving" : "Done"}
          </button>
        }
      />
      <div className="flex flex-col gap-10 py-4 pb-16">
        {sections.map(([title, Comp]) => (
          <div key={title} className="flex flex-col gap-3">
            <h2 className="px-4 text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
            <Comp p={p} set={set} />
          </div>
        ))}
      </div>
    </main>
  );
}
