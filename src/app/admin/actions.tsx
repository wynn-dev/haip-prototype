"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markContactHandled, resolveAppeal, resolveReport } from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReportActions({ id, reason }: { id: number; reason: string }) {
  const [removing, setRemoving] = useState(false);
  const [text, setText] = useState(`Your account was removed for: ${reason.toLowerCase()}. This breaks our community rules.`);
  const [pending, start] = useTransition();
  if (removing)
    return (
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-xs font-semibold">Reason shown to the user:</p>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="paper" className="h-10 flex-1" onClick={() => setRemoving(false)}>Cancel</Button>
          <Button variant="ink" className="h-10 flex-1 bg-brick" disabled={pending || text.trim().length < 10} onClick={() => start(async () => { await resolveReport(id, "upheld", text); toast.success("User removed"); })}>
            Remove user
          </Button>
        </div>
      </div>
    );
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      <Button variant="paper" className="h-10" disabled={pending} onClick={() => start(async () => { await resolveReport(id, "dismissed"); toast("Dismissed"); })}>Dismiss</Button>
      <Button variant="paper" className="h-10" disabled={pending} onClick={() => start(async () => { await resolveReport(id, "upheld"); toast("Upheld (warning)"); })}>Uphold</Button>
      <Button variant="ink" className="h-10" onClick={() => setRemoving(true)}>Remove…</Button>
    </div>
  );
}

export function AppealActions({ id }: { id: number }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="mt-3 flex flex-col gap-2">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Response to the user (optional)" />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="paper" className="h-10" disabled={pending} onClick={() => start(async () => { await resolveAppeal(id, false, text); toast("Appeal rejected"); })}>Reject</Button>
        <Button variant="oranje" className="h-10" disabled={pending} onClick={() => start(async () => { await resolveAppeal(id, true, text); toast.success("Account reinstated"); })}>Reinstate</Button>
      </div>
    </div>
  );
}

export function ContactDone({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(() => markContactHandled(id))} className="shrink-0 text-xs font-semibold underline">
      Mark handled
    </button>
  );
}
