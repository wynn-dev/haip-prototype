import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VerifySection } from "@/components/profile/verify-section";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Verification" };

export default async function VerifyPage() {
  const user = await requireUser();
  return (
    <main className="flex flex-col gap-5 px-5 pt-4 pb-8">
      <Link href="/app/me" className="flex items-center gap-1 text-sm font-semibold"><ArrowLeft className="size-4" /> Me</Link>
      <h1 className="font-display text-4xl font-extrabold">Verification</h1>
      <VerifySection state={{ ageVerified: !!user.ageVerifiedAt, studentInstitution: user.studentVerifiedAt ? user.studentInstitution : null }} />
    </main>
  );
}
