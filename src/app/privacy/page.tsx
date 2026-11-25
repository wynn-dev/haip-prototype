import Link from "next/link";
import { LargeTitle, NavBar, Row, Section } from "@/components/ios";
import { APP_NAME } from "@/lib/brand";

export const metadata = { title: "Your data" };

type Item = { what: string; why: string; who: string; kept: string };

const ACCOUNT: Item[] = [
  { what: "E-mail address", why: "Logging in and account messages", who: "Only you and our team", kept: "Until you delete your account" },
  { what: "Password", why: "Logging in. Stored only as a one-way hash, never readable", who: "Nobody", kept: "Until you delete your account" },
  { what: "Phone number", why: "Login codes (2-factor). Codes expire after 10 minutes", who: "Only you and our team", kept: "Until you delete your account" },
  { what: "Date of birth", why: "Making sure you're 18+. Others see only your age", who: "Only you and our team", kept: "Until you delete your account" },
  { what: "18+ check result", why: "Only pass/fail and the method. In this prototype the check is simulated", who: "Only our team", kept: "Until you delete your account" },
  { what: "Student e-mail", why: "Confirming you study somewhere. Others see only the institution's name", who: "Only you and our team", kept: "Until you delete your account" },
  { what: "Login cookie", why: "Keeping you logged in. Logging out signs you out on every device", who: "Only your browser", kept: "30 days, or until you log out" },
];

const PROFILE: Item[] = [
  { what: "Profile", why: "Username, photo, gender, age, languages, lifestyle, bio and what you're looking for, shown on your card and used for matching", who: "People who fit your filters", kept: "Until you change or delete it" },
  { what: "Preferences and allergies", why: "Used only to filter who you see. Never shown to anyone", who: "Nobody (used by the matching only)", kept: "Until you change or delete them" },
  { what: "Listing", why: "Photos, rent, contract, features and neighbourhood, shown to people looking for a room", who: "People who fit your filters", kept: "Until you change or delete it" },
  { what: "Exact street address", why: "So a match can come for a viewing", who: "Only people you've matched with", kept: "Until you change or delete it" },
  { what: "Photos", why: "Profile and listing photos. Stored at a public web address that is hard to guess", who: "People who see your card, or anyone given the link", kept: "Deleted from storage when you delete your account" },
];

const ACTIVITY: Item[] = [
  { what: "Swipes (likes and passes)", why: "So you never see the same person twice, and to create matches", who: "Nobody. People never learn that you passed", kept: "Until you delete your account" },
  { what: "Messages", why: "Chatting with your matches", who: "You and that match. Our team reads a chat only when one of you reports the other", kept: "When a chat ends (unmatch, block or report) it closes for both of you but is kept for safety reviews. If you delete your account, your messages stay in the other person's chat without your name" },
  { what: "Reports you make", why: "Keeping people safe", who: "Our team. The person you report never learns it was you", kept: "Kept for moderation history; your name is removed if you delete your account" },
  { what: "Reports about you", why: "Moderation", who: "Our team. You can see the reasons and outcomes in your data export", kept: "Kept even if you delete your account, so deleting can't be used to avoid moderation" },
  { what: "Blocks", why: "Hiding people from each other", who: "Only you", kept: "Until you unblock them or delete your account" },
  { what: "Removal and appeals", why: "If your account is removed: the reason, your appeal and our reply. Your e-mail and phone are kept as one-way hashes so a removed account can't sign up again", who: "You and our team", kept: "While the removal stands; hashes are deleted if an appeal succeeds" },
  { what: "Contact messages", why: "Your name, e-mail, organisation (for authorities) and message", who: "Our team", kept: "Until handled, then kept as a record" },
];

function Items({ header, items }: { header: string; items: Item[] }) {
  return (
    <>
      <h2 className="px-4 text-[22px] font-bold tracking-[-0.02em]">{header}</h2>
      {items.map((r) => (
        <Section key={r.what} header={r.what}>
          <p className="px-4 pt-3 text-[15px] leading-snug">{r.why}</p>
          <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1 px-4 pt-2 pb-3 text-[15px] leading-snug">
            <dt className="text-label-2">Who sees it</dt>
            <dd>{r.who}</dd>
            <dt className="text-label-2">How long</dt>
            <dd>{r.kept}</dd>
          </dl>
        </Section>
      ))}
    </>
  );
}

export default function PrivacyPage() {
  return (
    <main className="flex flex-col gap-6 pb-12">
      <div>
        <NavBar back={true} />
        <LargeTitle sub={`What ${APP_NAME} collects, why, who can see it, and how long we keep it. No ads, no selling of data, no tracking.`}>
          Your data
        </LargeTitle>
      </div>

      <Section header="Who we are">
        <p className="px-4 py-3 text-[15px] leading-relaxed">
          {APP_NAME} is a student prototype, not yet a registered company. The data controller would be the company that runs the app;
          until then, questions go to our team through <Link href="/contact" className="text-tint">Contact us</Link>. We process your data
          to provide the service you sign up for (your agreement with us) and, for safety and moderation, because we have a legitimate interest
          in keeping people safe.
        </p>
      </Section>

      <Section header="Where it's stored">
        <Row label="Database" value="Neon, Frankfurt (EU)" />
        <Row label="App servers" value="Vercel, Frankfurt (EU)" />
        <Row label="Photos" value="Cloudflare R2, Western Europe" />
        <p className="px-4 py-3 text-[13px] leading-snug text-label-2">
          These providers process data on our behalf. Vercel and Cloudflare are US companies; they also deliver pages and photos through
          servers worldwide.
        </p>
      </Section>

      <Items header="Your account" items={ACCOUNT} />
      <Items header="Your profile" items={PROFILE} />
      <Items header="What you do in the app" items={ACTIVITY} />

      <Section header="How matching works">
        <p className="px-4 py-3 text-[15px] leading-relaxed">
          You only see people where <b>both</b> of you pass each other&apos;s filters: city, budget (rooms up to 10% over yours; two people
          searching together need budgets within 50% of each other), number of housemates, gender and age preferences, dealbreakers, pets
          versus house rules, and cat, dog and smoke allergies. Everyone left is ranked by a score based on tidiness, sleep schedule, guests,
          shared languages, contract length, move-in date and budget. You can see the reasons on every card.
        </p>
      </Section>

      <Section header="Your rights">
        <Row label="See and download your data" detail="Profile → Export my data (JSON)" />
        <Row label="Delete your account" detail="Profile → Delete account. Takes effect straight away" />
        <Row label="Correct your data" detail="Edit your profile at any time" />
        <Row label="Ask a question or object" tint href="/contact" />
        <Row label="Complain to the Dutch regulator" tint href="https://autoriteitpersoonsgegevens.nl" detail="Autoriteit Persoonsgegevens" />
      </Section>

      <Section header="Account removal">
        <p className="px-4 py-3 text-[15px] leading-relaxed">
          We remove accounts that break our <Link href="/rules" className="text-tint">community rules</Link>: scams, harassment,
          discrimination, fake identities or being under 18. You&apos;ll see the reason when you log in, and you can appeal. A person on our
          team reviews every appeal.
        </p>
      </Section>
    </main>
  );
}
