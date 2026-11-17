"use client";

import { useActionState } from "react";
import { contactTeam } from "@/app/actions/safety";
import { Field, FormError } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm({ channel, defaultEmail }: { channel: "user" | "authority"; defaultEmail: string }) {
  const [state, action, pending] = useActionState(contactTeam, undefined);
  if (state?.ok)
    return (
      <div className="ink-card bg-polder/10 p-5 text-center">
        <div className="text-5xl">📬</div>
        <p className="mt-2 font-display text-xl font-bold">Got it, thanks.</p>
        <p className="text-sm text-muted-foreground">Someone from our team will reply by e-mail.</p>
      </div>
    );
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="channel" value={channel} />
      <Field label="Your name" htmlFor="name"><Input id="name" name="name" required /></Field>
      <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" defaultValue={defaultEmail} required /></Field>
      {channel === "authority" && (
        <Field label="Organisation" htmlFor="org"><Input id="org" name="organisation" required placeholder="e.g. Politie Eenheid Amsterdam" /></Field>
      )}
      <Field label="Subject" htmlFor="subject"><Input id="subject" name="subject" required /></Field>
      <Field label="Message" htmlFor="body"><Textarea id="body" name="body" rows={6} required className="min-h-36" /></Field>
      <FormError msg={state?.error} />
      <Button type="submit" variant="ink" size="xl" disabled={pending}>{pending ? "Sending…" : "Send to the team"}</Button>
    </form>
  );
}
