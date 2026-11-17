"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, GraduationCap, Landmark, ScanFace } from "lucide-react";
import { toast } from "sonner";
import { confirmStudentCode, sendStudentCode, verifyAge } from "@/app/actions/profile";
import { DemoSms } from "@/components/demo-sms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type VerifyState = { ageVerified: boolean; studentInstitution: string | null };

export function VerifySection({ state }: { state: VerifyState }) {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<{ code: string | null; institution: string } | null>(null);
  const [code, setCode] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <section className="ink-card p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold">18+ ID check</h3>
          <span className="chip bg-brick text-paper">required</span>
        </div>
        {state.ageVerified ? (
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-polder">
            <BadgeCheck className="size-5" /> Age verified
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              A date of birth alone is easy to fake. We confirm you&apos;re 18+ with a trusted provider and only keep the yes/no result.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="paper" size="xl" className="h-auto flex-col py-3 text-sm" disabled={pending} onClick={() => start(async () => { await verifyAge("idin"); toast.success("Age verified via iDIN (demo)"); })}>
                <Landmark className="size-5" /> Via your bank (iDIN)
              </Button>
              <Button variant="paper" size="xl" className="h-auto flex-col py-3 text-sm" disabled={pending} onClick={() => start(async () => { await verifyAge("id_scan"); toast.success("ID scan accepted (demo)"); })}>
                <ScanFace className="size-5" /> Scan ID + selfie
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Prototype: both options are simulated.</p>
          </>
        )}
      </section>

      <section className="ink-card p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold">Student check</h3>
          <span className="chip">optional</span>
        </div>
        {state.studentInstitution ? (
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-canal">
            <GraduationCap className="size-5" /> Verified student · {state.studentInstitution}
          </p>
        ) : !sent ? (
          <form
            className="mt-2 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await sendStudentCode(email);
                if (r.error) toast.error(r.error);
                else setSent({ code: r.demoCode ?? null, institution: r.institution! });
              });
            }}
          >
            <p className="text-sm text-muted-foreground">
              Get the <span className="font-semibold text-canal">🎓 student</span> badge by confirming your university e-mail. We don&apos;t show the address to anyone.
            </p>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="s1234567@student.uva.nl" />
            <Button type="submit" variant="ink" size="xl" disabled={pending}>Send code</Button>
          </form>
        ) : (
          <form
            className="mt-2 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await confirmStudentCode(code);
                if (r.error) toast.error(r.error);
                else toast.success(`You're verified at ${sent.institution} 🎓`);
              });
            }}
          >
            {sent.code && <DemoSms code={sent.code} from="E-mail" />}
            <p className="text-sm">Code sent to your {sent.institution} inbox.</p>
            <Input inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" className="font-mono tracking-widest" />
            <Button type="submit" variant="ink" size="xl" disabled={pending}>Confirm</Button>
          </form>
        )}
      </section>
    </div>
  );
}
