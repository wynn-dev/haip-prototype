"use client";

import { useOptimistic, useTransition } from "react";
import { setLookingStatus } from "@/app/actions/profile";
import { Segmented } from "@/components/pills";

type S = "looking" | "found_house" | "paused";

export function StatusSwitch({ value }: { value: S }) {
  const [v, setV] = useOptimistic(value);
  const [, start] = useTransition();
  return (
    <div>
      <h2 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">Status</h2>
      <Segmented<S>
        options={[
          { value: "looking", label: "Looking", emoji: "👀" },
          { value: "found_house", label: "Found a house", emoji: "🔑" },
          { value: "paused", label: "Hidden", emoji: "🙈" },
        ]}
        value={v}
        onChange={(s) => start(async () => { setV(s); await setLookingStatus(s); })}
      />
      {v === "paused" && <p className="mt-2 text-xs text-muted-foreground">You&apos;re hidden from the deck. Existing chats keep working.</p>}
    </div>
  );
}
