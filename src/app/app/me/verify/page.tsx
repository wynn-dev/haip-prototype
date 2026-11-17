import { LargeTitle, NavBar } from "@/components/ios";
import { VerifySection } from "@/components/profile/verify-section";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Verification" };

export default async function VerifyPage() {
  const user = await requireUser();
  return (
    <main className="flex flex-col pb-10">
      <NavBar back="/app/me" backLabel="Profile" />
      <LargeTitle>Verification</LargeTitle>
      <div className="pt-4">
        <VerifySection state={{ ageVerified: !!user.ageVerifiedAt, studentInstitution: user.studentVerifiedAt ? user.studentInstitution : null }} />
      </div>
    </main>
  );
}
