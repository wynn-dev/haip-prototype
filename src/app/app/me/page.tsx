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

      <Section
        header="Status"
        footer={
          row.profile.lookingStatus === "looking"
            ? "You're shown to people who fit your filters."
            : "You're not shown on anyone's Home screen. Existing chats keep working."
        }
      >
        <StatusSwitch value={row.profile.lookingStatus} role={user.role ?? "tenant"} />
      </Section>

      <Section header="Verification">
        <Row icon={IdCard} iconBg={user.ageVerifiedAt ? "bg-tint-fill" : "bg-caution-fill"} label="Age check" value={user.ageVerifiedAt ? "Verified" : "Required"} href="/app/me/verify" />
        <Row icon={GraduationCap} iconBg="bg-tint-fill" label="Student" value={user.studentVerifiedAt ? user.studentInstitution : "Not verified"} href="/app/me/verify" />
      </Section>

      <Section header="Help & safety">
        <Row icon={ShieldHalf} iconBg="bg-tile" label="Safety centre" href="/app/safety" />
        <Row icon={LifeBuoy} iconBg="bg-tint-fill" label="Contact us" href="/contact" />
        {user.isAdmin && <Row icon={ShieldCheck} iconBg="bg-tile" label="Moderation" href="/admin" />}
      </Section>

      <Section header="Your data" footer={`Signed in as ${user.email}. Only you can see this.`}>
        <Row icon={FileText} iconBg="bg-tile" label="What we store and why" href="/privacy" />
        <Row icon={Download} iconBg="bg-tile" label="Export my data" href="/api/me/export" download />
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
