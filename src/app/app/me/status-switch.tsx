"use client";

import { useOptimistic, useTransition } from "react";
import { setLookingStatus } from "@/app/actions/profile";
import { Segmented } from "@/components/ios";

type S = "looking" | "found_house" | "paused";

export function StatusSwitch({ value }: { value: S }) {
  const [v, setV] = useOptimistic(value);
  const [, start] = useTransition();
  return (
    <div className="px-4 py-3">
      <Segmented<S>
        options={[
          { value: "looking", label: "Looking" },
          { value: "found_house", label: "Found a house" },
          { value: "paused", label: "Hidden" },
        ]}
        value={v}
        onChange={(s) => start(async () => { setV(s); await setLookingStatus(s); })}
      />
    </div>
  );
}
