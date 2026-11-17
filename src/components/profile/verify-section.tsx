"use client";

import { useState, useTransition } from "react";
import { Check, GraduationCap, IdCard, Landmark, ScanFace } from "lucide-react";
import { toast } from "sonner";
import { confirmStudentCode, sendStudentCode, verifyAge } from "@/app/actions/profile";
import { DemoSms } from "@/components/demo-sms";
import { Row, Section, inputCls } from "@/components/ios";
import { Button } from "@/components/ui/button";

export type VerifyState = { ageVerified: boolean; studentInstitution: string | null };

export function VerifySection({ state }: { state: VerifyState }) {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<{ code: string | null; institution: string } | null>(null);
  const [code, setCode] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <Section
        header="Age check · required"
        footer={state.ageVerified ? undefined : "A date of birth is easy to fake. A trusted provider confirms you're 18+, and we only keep the yes/no result. Prototype: both options are simulated."}
      >
        {state.ageVerified ? (
          <Row icon={IdCard} iconBg="bg-green" label="Age verified" value={<Check className="size-5 text-green" strokeWidth={3} />} />
        ) : (
          <>
            <Row icon={Landmark} iconBg="bg-tint" label="Verify with your bank (iDIN)" chevron onClick={() => start(async () => { await verifyAge("idin"); toast.success("Age verified"); })} />
            <Row icon={ScanFace} iconBg="bg-label-2" label="Scan ID and take a selfie" chevron onClick={() => start(async () => { await verifyAge("id_scan"); toast.success("Age verified"); })} />
          </>
        )}
      </Section>

      <Section header="Student check · optional" footer={state.studentInstitution ? undefined : "Adds a verified-student badge to your profile. We never show your e-mail address."}>
        {state.studentInstitution ? (
          <Row icon={GraduationCap} iconBg="bg-tint" label="Verified student" detail={state.studentInstitution} value={<Check className="size-5 text-green" strokeWidth={3} />} />
        ) : !sent ? (
          <form
            className="flex items-center pr-2"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await sendStudentCode(email);
                if (r.error) toast.error(r.error);
                else setSent({ code: r.demoCode ?? null, institution: r.institution! });
              });
            }}
          >
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="University e-mail" className={inputCls} />
            <Button type="submit" variant="plain" disabled={pending || !email} className="h-9 px-2 text-[17px]">Send code</Button>
          </form>
        ) : (
          <form
            className="flex items-center pr-2"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await confirmStudentCode(code);
                if (r.error) toast.error(r.error);
                else toast.success(`Verified at ${sent.institution}`);
              });
            }}
          >
            <input inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" className={inputCls + " tabular-nums"} />
            <Button type="submit" variant="plain" disabled={pending || code.length < 6} className="h-9 px-2 text-[17px]">Confirm</Button>
          </form>
        )}
      </Section>
      {sent?.code && !state.studentInstitution && (
        <div className="px-4">
          <DemoSms code={sent.code} from="Mail" />
        </div>
      )}
    </div>
  );
}
