"use client";

import { useTransition } from "react";
import { unblockUser } from "@/app/actions/safety";

export function UnblockButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(async () => { await unblockUser(id); })} className="text-tint disabled:opacity-40">
      Unblock
    </button>
  );
}
