"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { FormError } from "@/components/field";
import { BottomBar, LabeledInput, LargeTitle, NavBar } from "@/components/ios";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-1 flex-col">
      <NavBar back="/" />
      <LargeTitle sub="Next, you'll enter a login code sent to your phone.">Log in</LargeTitle>
      <div className="mt-4 flex flex-col gap-6">
        <section className="px-4">
          <div className="group-list">
            <LabeledInput label="E-mail" id="email" name="email" defaultValue={state?.values?.email} type="email" autoComplete="email" required placeholder="you@example.com" />
            <LabeledInput label="Password" id="password" name="password" type="password" autoComplete="current-password" required placeholder="Required" />
          </div>
        </section>
        <FormError msg={state?.error} />
        <section className="px-4">
          <h2 className="section-header">Demo accounts</h2>
          <div className="group-list text-[15px]">
            {[
              ["sanne@demo.test", "Looking for a room"],
              ["daan@demo.test", "Has a room"],
              ["admin@demo.test", "Moderator"],
            ].map(([e, d]) => (
              <div key={e} className="flex items-center justify-between px-4 py-2.5">
                <span className="font-mono text-[14px]">{e}</span>
                <span className="text-label-2">{d}</span>
              </div>
            ))}
          </div>
          <p className="section-footer">Password for all: roommates</p>
        </section>
      </div>
      <BottomBar>
        <Button type="submit" variant="filled" size="xl" className="w-full" disabled={pending}>
          {pending ? "Checking…" : "Continue"}
        </Button>
        <p className="pt-3 text-center text-[15px] text-label-2">
          New here? <Link href="/signup" className="text-tint">Create an account</Link>
        </p>
      </BottomBar>
    </form>
  );
}
