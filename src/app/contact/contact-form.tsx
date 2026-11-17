"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { contactTeam } from "@/app/actions/safety";
import { FormError } from "@/components/field";
import { BottomBar, Section, inputCls } from "@/components/ios";
import { Button } from "@/components/ui/button";

export function ContactForm({ channel, defaultEmail }: { channel: "user" | "authority"; defaultEmail: string }) {
  const [state, action, pending] = useActionState(contactTeam, undefined);
  if (state?.ok)
    return (
      <div className="flex flex-col items-center gap-2 px-8 pt-10 text-center">
        <CheckCircle2 className="size-14 text-positive" strokeWidth={1.5} />
        <p className="text-[22px] font-bold tracking-[-0.02em]">Message sent</p>
        <p className="text-[15px] text-label-2">Someone from our team will reply by e-mail.</p>
      </div>
    );
  return (
    <form action={action} className="flex flex-1 flex-col gap-6">
      <input type="hidden" name="channel" value={channel} />
      <Section>
        <input name="name" required placeholder="Your name" className={inputCls} />
        <input name="email" type="email" defaultValue={defaultEmail} required placeholder="E-mail" className={inputCls} />
        {channel === "authority" && <input name="organisation" required placeholder="Organisation" className={inputCls} />}
      </Section>
      <Section footer={channel === "authority" ? "Include a case or reference number if you have one." : "In immediate danger? Call 112."}>
        <input name="subject" required placeholder="Subject" className={inputCls} />
        <textarea name="body" rows={6} required placeholder="Message" className="block w-full resize-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-label-3" />
      </Section>
      <FormError msg={state?.error} />
      <BottomBar>
        <Button type="submit" variant="filled" size="xl" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send"}</Button>
      </BottomBar>
    </form>
  );
}
