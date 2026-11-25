import Link from "next/link";
import { LargeTitle, NavBar } from "@/components/ios";
import { currentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact us" };

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { channel } = await searchParams;
  const authority = channel === "authority";
  const user = await currentUser();
  return (
    <main className="flex flex-1 flex-col pb-10">
      <NavBar back={true} />
      <LargeTitle
        sub={
          authority
            ? "Police, municipalities and regulators can reach our internal team directly. Authority requests are shown first in the team inbox and kept on record."
            : "A person on our internal team reads every message and replies to the e-mail address you give."
        }
      >
        {authority ? "Authorities" : "Contact us"}
      </LargeTitle>
      <div className="px-4 pt-3 pb-6">
        <div className="grid grid-cols-2 rounded-[9px] bg-fill p-[2px] text-center text-[13px]">
          <Link href="/contact" replace className={cn("rounded-[7px] py-1.5", !authority && "bg-surface font-semibold shadow-[0_3px_8px_rgb(0_0_0/0.12)]")}>I use the app</Link>
          <Link href="/contact?channel=authority" replace className={cn("rounded-[7px] py-1.5", authority && "bg-surface font-semibold shadow-[0_3px_8px_rgb(0_0_0/0.12)]")}>Authority</Link>
        </div>
      </div>
      <ContactForm key={authority ? "a" : "u"} channel={authority ? "authority" : "user"} defaultEmail={user?.email ?? ""} />
    </main>
  );
}
