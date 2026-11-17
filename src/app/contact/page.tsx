import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Talk to a human" };

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { channel } = await searchParams;
  const authority = channel === "authority";
  const user = await currentUser();
  return (
    <main className="flex flex-1 flex-col gap-5 px-5 pt-4 pb-10">
      <Link href={user ? "/app/me" : "/"} className="flex items-center gap-1 text-sm font-semibold"><ArrowLeft className="size-4" /> Back</Link>
      <div className="grid grid-cols-2 gap-1 rounded-2xl border-[1.5px] border-ink bg-card p-1 text-center text-sm font-semibold">
        <Link href="/contact" className={!authority ? "rounded-xl bg-ink py-2 text-paper" : "py-2"}>I use the app</Link>
        <Link href="/contact?channel=authority" className={authority ? "rounded-xl bg-ink py-2 text-paper" : "py-2"}>Authorities</Link>
      </div>
      <div>
        <h1 className="font-display text-4xl leading-none font-extrabold">{authority ? "Law enforcement & authorities" : "Talk to a human"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {authority
            ? "Police, municipalities and regulators can reach our internal team here. Requests are prioritised and logged. Include a case or reference number if you have one."
            : "No bots. A person on our internal team reads this and replies by e-mail, usually within 24 hours. In immediate danger? Call 112."}
        </p>
      </div>
      <ContactForm channel={authority ? "authority" : "user"} defaultEmail={user?.email ?? ""} />
    </main>
  );
}
