import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-6 pt-4 pb-6 text-[13px] text-label-2">
      <Link href="/privacy" className="active:opacity-60">Privacy</Link>
      <Link href="/contact" className="active:opacity-60">Contact us</Link>
      <Link href="/contact?channel=authority" className="active:opacity-60">Authorities</Link>
      <span>18+</span>
    </footer>
  );
}
