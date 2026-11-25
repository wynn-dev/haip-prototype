"use client";

import { useOptimistic, useTransition } from "react";
import { setLookingStatus } from "@/app/actions/profile";
import { Segmented } from "@/components/ios";

type S = "looking" | "found_house" | "paused";

export function StatusSwitch({ value, role }: { value: S; role: "renter" | "tenant" }) {
  const [v, setV] = useOptimistic(value);
  const [, start] = useTransition();
  return (
    <div className="px-4 py-3">
      <Segmented<S>
        options={[
          { value: "looking", label: "Looking" },
          { value: "found_house", label: role === "renter" ? "Room filled" : "Found a place" },
          { value: "paused", label: "Hidden" },
        ]}
        value={v}
        onChange={(s) => start(async () => { setV(s); await setLookingStatus(s); })}
      />
    </div>
  );
}
