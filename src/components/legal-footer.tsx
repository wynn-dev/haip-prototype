import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-6 py-5 text-xs text-muted-foreground">
      <Link href="/privacy" className="underline-offset-2 hover:underline">Your data</Link>
      <Link href="/contact" className="underline-offset-2 hover:underline">Talk to a human</Link>
      <Link href="/contact?channel=authority" className="underline-offset-2 hover:underline">For authorities</Link>
      <span>18+ only</span>
    </footer>
  );
}
