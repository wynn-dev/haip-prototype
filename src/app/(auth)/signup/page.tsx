"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signup } from "@/app/actions/auth";
import { FormError } from "@/components/field";
import { BottomBar, LargeTitle, NavBar, inputCls } from "@/components/ios";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  // browser hint only; the server enforces 18+
  const [maxDob] = useState(() => new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10));

  return (
    <form action={action} className="flex flex-1 flex-col">
      <NavBar back="/" />
      <LargeTitle sub="Your e-mail, phone and date of birth are never shown to other people.">Create account</LargeTitle>

      <div className="mt-4 flex flex-col gap-6">
        <section className="px-4">
          <div className="group-list">
            <input id="email" name="email" defaultValue={state?.values?.email} type="email" autoComplete="email" required placeholder="E-mail" className={inputCls} />
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="Password (8+ characters)" className={inputCls} />
          </div>
        </section>

        <section className="px-4">
          <div className="group-list">
            <input id="phone" name="phone" defaultValue={state?.values?.phone} type="tel" autoComplete="tel" required placeholder="Phone, e.g. +31 6 1234 5678" className={inputCls} />
          </div>
          <p className="section-footer">We text you a code each time you log in.</p>
        </section>

        <section className="px-4">
          <h2 className="section-header">Date of birth</h2>
          <div className="group-list">
            <input id="dob" name="dob" defaultValue={state?.values?.dob} type="date" max={maxDob} required className={inputCls} />
          </div>
          <p className="section-footer">You must be 18 or older. We&apos;ll also do an ID check before you can match. Others only see your age.</p>
        </section>

        <label className="flex items-start gap-3 px-8 text-[15px] leading-snug text-label-2">
          <input type="checkbox" name="consent" required className="mt-0.5 size-[18px] shrink-0 accent-[var(--tint)]" />
          <span>
            I&apos;ve read <Link href="/privacy" className="text-tint">what data is collected and why</Link>.
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
