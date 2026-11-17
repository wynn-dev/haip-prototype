"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signup } from "@/app/actions/auth";
import { Field, FormError } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  // browser hint only; the server enforces 18+
  const [maxDob] = useState(() => new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10));

  return (
    <form action={action} className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Make an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your email, phone and birthday stay private. Other people only see your age.
        </p>
      </div>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" defaultValue={state?.values?.email} type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Field label="Phone" htmlFor="phone" hint="We text a code here every time you log in (2-factor).">
        <Input id="phone" name="phone" defaultValue={state?.values?.phone} type="tel" autoComplete="tel" required placeholder="+31 6 1234 5678" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Date of birth" htmlFor="dob" hint="18+ only. We'll also ask for an ID check before you can match.">
        <Input id="dob" name="dob" defaultValue={state?.values?.dob} type="date" max={maxDob} required />
      </Field>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-[var(--oranje)]" />
        <span>
          I&apos;ve read <Link href="/privacy" className="font-semibold underline">what data is collected and why</Link>.
        </span>
      </label>
      <FormError msg={state?.error} />
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <Button type="submit" variant="ink" size="xl" disabled={pending}>
          {pending ? "Creating…" : "Continue"}
        </Button>
        <p className="text-center text-sm">
          Already have one? <Link href="/login" className="font-semibold underline">Log in</Link>
        </p>
      </div>
    </form>
  );
}
