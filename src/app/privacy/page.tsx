import { LargeTitle, NavBar, Row, Section } from "@/components/ios";

export const metadata = { title: "Your data" };

const ROWS: { what: string; why: string; who: string; kept: string }[] = [
  { what: "E-mail address", why: "Log in, account recovery, important notices", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "Phone number", why: "2-factor login codes", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "Date of birth", why: "Proving you're 18+. Others only see your age", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "ID-check result", why: "Reliable 18+ verification. We store only pass/fail and the method, never the document", who: "Only our team", kept: "Until you delete your account" },
  { what: "Student e-mail", why: "Verifying enrolment. Others see only the institution name", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "Profile", why: "Username, photo, gender, age, languages, lifestyle, preferences and allergies are shown on your card and used for matching", who: "Other users", kept: "Until you delete it" },
  { what: "Listing", why: "Photos, rent, contract length, features and neighbourhood are shown to people looking for a room", who: "Other users", kept: "Until you delete it" },
  { what: "Exact street address", why: "So matches can visit", who: "Only people you matched with", kept: "Until you delete it" },
  { what: "Swipes (likes & passes)", why: "Never show you the same person twice, create matches, limit likes", who: "Nobody. Others never learn you passed", kept: "Until you delete your account" },
  { what: "Messages", why: "Chat with your matches", who: "You and that match; our team only when a report is filed", kept: "Until you or they delete the account, or unmatch" },
  { what: "Reports & blocks", why: "Keeping people safe, moderation history", who: "Our team. The reported person never sees who reported them", kept: "Reports: 2 years (anonymised if you delete); blocks: until deleted" },
];

export default function PrivacyPage() {
  return (
    <main className="flex flex-col gap-8 pb-12">
      <div>
        <NavBar back={true} />
        <LargeTitle sub="No selling of data, no ads, no tracking. Data is stored in the EU-friendly cloud (Postgres on Neon, photos on Cloudflare R2).">
          Your data
        </LargeTitle>
      </div>

      {ROWS.map((r) => (
        <Section key={r.what} header={r.what}>
          <Row label="Why" value={<span className="block max-w-[62%] text-right text-[15px] leading-snug">{r.why}</span>} className="items-start py-3" />
          <Row label="Who sees it" value={<span className="block max-w-[62%] text-right text-[15px] leading-snug text-label">{r.who}</span>} className="items-start py-3" />
          <Row label="Kept" value={<span className="block max-w-[62%] text-right text-[15px] leading-snug">{r.kept}</span>} className="items-start py-3" />
        </Section>
      ))}

      <Section header="How matching works">
        <p className="px-4 py-3 text-[15px] leading-relaxed">
          You only see people where <b>both</b> of you pass each other&apos;s filters: gender and age preferences, dealbreakers, allergies versus
          pets and smoke, budget versus rent (up to 10% over), and city. Everyone left is ranked by a compatibility score based on tidiness,
          sleep, guests, languages, timing and budget, which you can see on every card.
        </p>
      </Section>

      <Section header="Your rights">
        <Row label="Export everything" detail="Profile → Export my data (JSON)" />
        <Row label="Delete your account" detail="Profile → Delete account, immediate" />
        <Row label="Correct your data" detail="Edit your profile at any time" />
        <Row label="Ask or object" tint href="/contact" detail="Or complain to the Autoriteit Persoonsgegevens" />
      </Section>

      <Section header="Account removal">
        <p className="px-4 py-3 text-[15px] leading-relaxed">
          We remove accounts for scams, harassment, discrimination, fake identities or being under 18. You&apos;ll always see the reason
          when you log in and can appeal. A different team member reviews the appeal.
        </p>
      </Section>
    </main>
  );
}
