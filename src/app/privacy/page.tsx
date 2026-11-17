import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DAILY_LIKES } from "@/lib/options";

export const metadata = { title: "Your data" };

const ROWS: { what: string; why: string; who: string; kept: string }[] = [
  { what: "E-mail address", why: "Log in, account recovery, important notices", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "Phone number", why: "2-factor login codes", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "Date of birth", why: "Proving you're 18+. Others only see your age", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "ID-check result", why: "Reliable 18+ verification. We store only pass/fail and the method, never the document", who: "Only our team", kept: "Until you delete your account" },
  { what: "Student e-mail", why: "Verifying enrolment. Others see only the institution name", who: "Only you & our team", kept: "Until you delete your account" },
  { what: "Profile (username, photo, gender, age, languages, lifestyle, preferences, allergies)", why: "Shown on your card, used by the matching algorithm", who: "Other users", kept: "Until you delete it" },
  { what: "Listing (photos, rent, duration, features, neighbourhood)", why: "Shown on your card to tenants", who: "Other users", kept: "Until you delete it" },
  { what: "Exact street address", why: "So matches can visit", who: "Only people you matched with", kept: "Until you delete it" },
  { what: "Swipes (likes & passes)", why: "Never show you the same person twice, create matches, limit likes", who: "Nobody. Others never learn you passed", kept: "Until you delete your account" },
  { what: "Messages", why: "Chat with your matches", who: "You and that match; our team only when a report is filed", kept: "Until you or they delete the account, or unmatch" },
  { what: "Reports & blocks", why: "Keeping people safe, moderation history", who: "Our team. The reported person never sees who reported them", kept: "Reports: 2 years (anonymised if you delete); blocks: until deleted" },
];

export default function PrivacyPage() {
  return (
    <main className="flex flex-col gap-5 px-5 pt-4 pb-10">
      <Link href="/" className="flex items-center gap-1 text-sm font-semibold"><ArrowLeft className="size-4" /> Back</Link>
      <div>
        <p className="chip mb-3 bg-butter">plain-language privacy</p>
        <h1 className="font-display text-4xl leading-none font-extrabold">What we collect, and why</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          No selling of data, no ads, no tracking pixels. We store data in the EU (Postgres on Neon, images on Cloudflare R2).
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {ROWS.map((r) => (
          <li key={r.what} className="ink-card p-4">
            <p className="font-display text-lg leading-tight font-bold">{r.what}</p>
            <dl className="mt-2 grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Why</dt><dd>{r.why}</dd>
              <dt className="text-muted-foreground">Who sees</dt><dd className="font-semibold">{r.who}</dd>
              <dt className="text-muted-foreground">Kept</dt><dd>{r.kept}</dd>
            </dl>
          </li>
        ))}
      </ul>

      <section className="ink-card bg-lilac/30 p-4 text-sm">
        <h2 className="font-display text-xl font-bold">How matching works</h2>
        <p className="mt-1">
          You only see people where <b>both</b> of you pass each other&apos;s hard filters: gender and age preferences, dealbreakers, allergies vs pets and smoke,
          budget vs rent (up to 10% over), and city. The rest is ranked by a compatibility score (tidiness, sleep, guests, languages, timing, budget)
          that you can see on every card. You get {DAILY_LIKES} likes per 24 hours, so people spread their attention and more people get matches.
        </p>
      </section>

      <section className="ink-card p-4 text-sm">
        <h2 className="font-display text-xl font-bold">Your rights</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li><b>Export</b>: Me → Export my data gives you everything as a JSON file.</li>
          <li><b>Delete</b>: Me → Delete my account removes everything immediately.</li>
          <li><b>Correct</b>: edit your profile anytime.</li>
          <li><b>Object or ask</b>: <Link href="/contact" className="underline">talk to a human</Link>, or complain to the Autoriteit Persoonsgegevens.</li>
        </ul>
      </section>

      <section className="ink-card p-4 text-sm">
        <h2 className="font-display text-xl font-bold">Account removal</h2>
        <p className="mt-1">
          We remove accounts for scams, harassment, discrimination, fake identities or being under 18. You&apos;ll always be told the reason
          when you log in and can appeal once; a different team member reviews the appeal.
        </p>
      </section>
    </main>
  );
}
