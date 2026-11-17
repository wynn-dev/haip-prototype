"use client";

import { useActionState } from "react";
import { submitAppeal } from "@/app/actions/moderation";
import { FormError } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AppealForm() {
  const [state, action, pending] = useActionState(submitAppeal, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <h2 className="font-display text-2xl font-bold">Think we got it wrong?</h2>
      <p className="text-sm text-muted-foreground">Tell us what happened. Appeals are reviewed by a person, usually within 3 working days.</p>
      <Textarea name="message" rows={6} className="min-h-36" required minLength={20} placeholder="Explain why the removal was a mistake…" />
      <FormError msg={state?.error} />
      <Button type="submit" variant="ink" size="xl" disabled={pending}>{pending ? "Sending…" : "Submit appeal"}</Button>
    </form>
  );
}
