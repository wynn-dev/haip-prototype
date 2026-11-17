import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { loadDraft } from "@/lib/load-profile";
import { OnboardingFlow } from "./flow";

export const metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const user = await requireUser({ onboarded: false });
  if (user.onboardedAt) redirect("/app");
  return (
    <OnboardingFlow
      initial={await loadDraft(user)}
      verify={{ ageVerified: !!user.ageVerifiedAt, studentInstitution: user.studentInstitution }}
    />
  );
}
