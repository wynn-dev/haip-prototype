"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signup } from "@/app/actions/auth";
import { FormError } from "@/components/field";
import { BottomBar, LabeledInput, LargeTitle, NavBar } from "@/components/ios";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  // browser hint only; the server enforces 18+
  const [maxDob] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  });

  return (
    <form action={action} className="flex flex-1 flex-col">
      <NavBar back="/" />
      <LargeTitle sub="Your e-mail, phone and date of birth are never shown to other people.">Create account</LargeTitle>

      <div className="mt-4 flex flex-col gap-6">
        <section className="px-4">
          <div className="group-list">
            <LabeledInput label="E-mail" id="email" name="email" defaultValue={state?.values?.email} type="email" autoComplete="email" required placeholder="you@example.com" />
            <LabeledInput label="Password" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="8+ characters" />
          </div>
        </section>

        <section className="px-4">
          <div className="group-list">
            <LabeledInput label="Phone" id="phone" name="phone" defaultValue={state?.values?.phone} type="tel" autoComplete="tel" required placeholder="+31 6 1234 5678" />
          </div>
          <p className="section-footer">Used for a login code each time you log in. In this prototype the code is shown on screen instead of texted.</p>
        </section>

        <section className="px-4">
          <div className="group-list">
            <LabeledInput label="Date of birth" id="dob" name="dob" defaultValue={state?.values?.dob} type="date" max={maxDob} min="1920-01-01" required />
          </div>
          <p className="section-footer">You must be 18 or older. We&apos;ll also do an ID check before you can match. Others only see your age.</p>
        </section>

        <label className="flex items-start gap-3 px-8 text-[15px] leading-snug text-label-2">
          <input type="checkbox" name="consent" required className="mt-0.5 size-[18px] shrink-0 accent-[var(--tint)]" />
          <span>
            I&apos;ve read <Link href="/privacy" className="text-tint">what data is collected and why</Link> and agree to the{" "}
            <Link href="/rules" className="text-tint">community rules</Link>.
          </span>
        </label>
        <FormError msg={state?.error} />
      </div>

      <BottomBar>
        <Button type="submit" variant="filled" size="xl" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Continue"}
        </Button>
      </BottomBar>
    </form>
  );
}
