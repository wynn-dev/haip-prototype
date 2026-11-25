"use client";

import { useActionState } from "react";
import { submitAppeal } from "@/app/actions/moderation";
import { FormError } from "@/components/field";
import { Section } from "@/components/ios";
import { Button } from "@/components/ui/button";

export function AppealForm() {
  const [state, action, pending] = useActionState(submitAppeal, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <Section header="Appeal" footer="Tell us what happened. A person on our team reviews every appeal, and the decision appears on this page.">
        <textarea aria-label="Your appeal" maxLength={3000} name="message" rows={5} required minLength={20} placeholder="Why do you think this was a mistake?" className="block w-full resize-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-label-3" />
      </Section>
      <FormError msg={state?.error} />
      <div className="px-4">
        <Button type="submit" variant="filled" size="xl" className="w-full" disabled={pending}>{pending ? "Sending…" : "Submit appeal"}</Button>
      </div>
    </form>
  );
}
