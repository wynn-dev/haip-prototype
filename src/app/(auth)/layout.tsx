import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { LegalFooter } from "@/components/legal-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col">
      <header className="px-5 pt-5">
        <Link href="/"><Wordmark /></Link>
      </header>
      <div className="flex flex-1 flex-col px-5 pt-8">{children}</div>
      <LegalFooter />
    </main>
  );
}
