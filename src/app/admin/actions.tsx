"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markContactHandled, resolveAppeal, resolveReport } from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";

const area = "block w-full resize-none rounded-[10px] bg-fill px-3 py-2 text-[15px] outline-none placeholder:text-label-3";

export function ReportActions({ id, reason }: { id: number; reason: string }) {
  const [removing, setRemoving] = useState(false);
  const [text, setText] = useState(`Your account was removed for: ${reason.toLowerCase()}. This breaks our community rules.`);
  const [pending, start] = useTransition();
  if (removing)
    return (
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-[13px] text-label-2">Reason shown to the user</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={area} />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="tinted" className="h-10 text-[15px]" onClick={() => setRemoving(false)}>Cancel</Button>
          <Button variant="danger" className="h-10 text-[15px]" disabled={pending || text.trim().length < 10} onClick={() => start(async () => { await resolveReport(id, "upheld", text); toast.success("User removed"); })}>
            Remove user
          </Button>
        </div>
      </div>
    );
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      <Button variant="tinted" className="h-10 text-[15px]" disabled={pending} onClick={() => start(async () => { await resolveReport(id, "dismissed"); toast("Dismissed"); })}>Dismiss</Button>
      <Button variant="tinted" className="h-10 text-[15px]" disabled={pending} onClick={() => start(async () => { await resolveReport(id, "upheld"); toast("Upheld"); })}>Uphold</Button>
      <Button variant="danger" className="h-10 text-[15px]" onClick={() => setRemoving(true)}>Remove</Button>
    </div>
  );
}

export function AppealActions({ id }: { id: number }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="mt-3 flex flex-col gap-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Reply to the user (optional)" className={area} />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="tinted" className="h-10 text-[15px]" disabled={pending} onClick={() => start(async () => { await resolveAppeal(id, false, text); toast("Appeal rejected"); })}>Reject</Button>
        <Button variant="filled" className="h-10 text-[15px]" disabled={pending} onClick={() => start(async () => { await resolveAppeal(id, true, text); toast.success("Account reinstated"); })}>Reinstate</Button>
      </div>
    </div>
  );
}

export function ContactDone({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(() => markContactHandled(id))} className="shrink-0 text-[15px] text-tint disabled:opacity-40">
      Done
    </button>
  );
}
