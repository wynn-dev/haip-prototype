import Link from "next/link";
import { LargeTitle, NavBar, Section } from "@/components/ios";

export const metadata = { title: "Community rules" };

const RULES = [
  ["Be who you say you are", "Use your own photos and real details. One account per person. No fake or misleading listings."],
  ["Never ask for money up front", "No deposits, \"reservation fees\" or rent before a viewing and a signed contract. Report anyone who asks."],
  ["Respect people", "No harassment, threats, insults or unwanted sexual messages. Take no for an answer."],
  ["No discrimination", "Don't exclude or insult people for their background, religion, nationality, disability or sexuality. Your gender and age preferences are only used as filters."],
  ["18 and over only", "You must be 18 or older. Report anyone who seems younger."],
  ["Keep it legal", "No illegal subletting, no listings you have no right to rent out, nothing that breaks Dutch law."],
] as const;

export default function RulesPage() {
  return (
    <main className="flex flex-col gap-6 pb-12">
      <div>
        <NavBar back={true} />
        <LargeTitle sub="Breaking these can get your account removed. You can always appeal.">Community rules</LargeTitle>
      </div>
      <Section>
        {RULES.map(([title, body], i) => (
          <div key={title} className="flex gap-3 px-4 py-3">
            <span className="w-5 shrink-0 text-[15px] font-semibold text-label-2 tabular-nums">{i + 1}</span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-[15px] leading-snug text-label-2">{body}</p>
            </div>
          </div>
        ))}
      </Section>
      <p className="px-8 text-center text-[13px] text-label-2">
        See something wrong? Use Report on their card or in the chat, or <Link href="/contact" className="text-tint">contact us</Link>.
      </p>
    </main>
  );
}
