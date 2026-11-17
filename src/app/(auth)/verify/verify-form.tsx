"use client";

import { useActionState, useState, useTransition } from "react";
import { resendCode, verifyLogin } from "@/app/actions/auth";
import { DemoSms } from "@/components/demo-sms";
import { FormError } from "@/components/field";
import { BottomBar, LargeTitle, NavBar } from "@/components/ios";
import { Button } from "@/components/ui/button";

export function VerifyForm({ demoCode }: { demoCode: string | null }) {
  const [state, action, pending] = useActionState(verifyLogin, undefined);
  const [code, setCode] = useState(demoCode);
  const [resending, start] = useTransition();

  return (
    <form action={action} className="flex flex-1 flex-col">
      {code && <div className="absolute inset-x-2 top-2 z-30"><DemoSms code={code} /></div>}
      <NavBar back="/login" />
      <LargeTitle sub="Enter the 6-digit code we texted you.">Verify it&apos;s you</LargeTitle>
      <div className="mt-6 flex flex-col gap-4 px-4">
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="000000"
          className="h-16 w-full rounded-xl bg-surface text-center text-[32px] font-semibold tracking-[0.4em] tabular-nums outline-none placeholder:text-label-3"
        />
        <FormError msg={state?.error} />
        <button
          type="button"
          disabled={resending}
          onClick={() => start(async () => setCode((await resendCode())?.demoCode ?? null))}
          className="self-center text-[15px] text-tint active:opacity-60"
        >
          {resending ? "Sending…" : "Send a new code"}
        </button>
      </div>
      <BottomBar>
        <Button type="submit" variant="filled" size="xl" className="w-full" disabled={pending}>
          {pending ? "Checking…" : "Verify"}
        </Button>
      </BottomBar>
    </form>
  );
}
