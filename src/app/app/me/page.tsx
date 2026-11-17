import { Download, FileText, GraduationCap, IdCard, LifeBuoy, ShieldCheck, ShieldHalf } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { LargeTitle, Row, Section } from "@/components/ios";
import { requireUser } from "@/lib/auth";
import { loadRow, toCard } from "@/lib/deck";
import { DeleteAccount } from "./delete-account";
import { ProfileHeader } from "./profile-header";
import { StatusSwitch } from "./status-switch";

export const metadata = { title: "Profile" };

export default async function MePage() {
  const user = await requireUser();
  const row = (await loadRow(user.id))!;
  const card = toCard(row, null, true);

  return (
    <main className="flex flex-col gap-8 pb-10">
      <LargeTitle>Profile</LargeTitle>

      <ProfileHeader card={card} />

      <Section header="Visibility" footer={row.profile.lookingStatus === "paused" ? "You're hidden from Discover. Existing chats keep working." : undefined}>
        <StatusSwitch value={row.profile.lookingStatus} />
      </Section>

      <Section header="Verification">
        <Row icon={IdCard} iconBg={user.ageVerifiedAt ? "bg-green" : "bg-orange"} label="Age check" value={user.ageVerifiedAt ? "Verified" : "Required"} href="/app/me/verify" />
        <Row icon={GraduationCap} iconBg="bg-tint" label="Student" value={user.studentVerifiedAt ? user.studentInstitution : "Not verified"} href="/app/me/verify" />
      </Section>

      <Section header="Help & safety">
        <Row icon={ShieldHalf} iconBg="bg-label-2" label="Safety centre" href="/app/safety" />
        <Row icon={LifeBuoy} iconBg="bg-tint" label="Contact us" href="/contact" />
        {user.isAdmin && <Row icon={ShieldCheck} iconBg="bg-label" label="Moderation" href="/admin" />}
      </Section>

      <Section header="Your data" footer={`Signed in as ${user.email}. Only you can see this.`}>
        <Row icon={FileText} iconBg="bg-label-2" label="What we store and why" href="/privacy" />
        <Row icon={Download} iconBg="bg-label-2" label="Export my data" href="/api/me/export" download />
      </Section>

      <Section>
        <form action={logout}>
          <button className="flex min-h-11 w-full items-center px-4 text-tint active:bg-fill">Log out</button>
        </form>
        <DeleteAccount />
      </Section>
    </main>
  );
}
