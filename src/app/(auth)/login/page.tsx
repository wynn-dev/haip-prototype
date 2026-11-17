"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Field, FormError } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">We&apos;ll text you a code after this.</p>
      </div>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" defaultValue={state?.values?.email} type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormError msg={state?.error} />
      <div className="rounded-xl border-[1.5px] border-dashed border-ink/40 p-3 text-xs text-muted-foreground">
        <b className="text-ink">Demo accounts</b> (password <code>roommates</code>):<br />
        sanne@demo.test (tenant) · daan@demo.test (renter) · admin@demo.test (moderator)
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <Button type="submit" variant="ink" size="xl" disabled={pending}>
          {pending ? "Checking…" : "Log in"}
        </Button>
        <p className="text-center text-sm">
          New here? <Link href="/signup" className="font-semibold underline">Make an account</Link>
        </p>
      </div>
    </form>
  );
}
