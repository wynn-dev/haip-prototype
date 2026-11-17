"use client";

import { useActionState, useState, useTransition } from "react";
import { resendCode, verifyLogin } from "@/app/actions/auth";
import { FormError } from "@/components/field";
import { DemoSms } from "@/components/demo-sms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerifyForm({ demoCode }: { demoCode: string | null }) {
  const [state, action, pending] = useActionState(verifyLogin, undefined);
  const [code, setCode] = useState(demoCode);
  const [resending, start] = useTransition();

  return (
    <form action={action} className="flex flex-1 flex-col gap-4">
      {code && <DemoSms code={code} />}
      <div>
        <h1 className="font-display text-3xl font-extrabold">Check your phone</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code we just texted you.</p>
      </div>
      <Input
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        autoFocus
        placeholder="••••••"
        className="h-16 text-center font-mono text-3xl tracking-[0.5em]"
      />
      <FormError msg={state?.error} />
      <button
        type="button"
        disabled={resending}
        onClick={() => start(async () => setCode((await resendCode())?.demoCode ?? null))}
        className="self-start text-sm font-semibold underline underline-offset-4"
      >
        {resending ? "Sending…" : "Send a new code"}
      </button>
      <div className="mt-auto pt-4">
        <Button type="submit" variant="ink" size="xl" className="w-full" disabled={pending}>
          {pending ? "Checking…" : "Verify"}
        </Button>
      </div>
    </form>
  );
}
