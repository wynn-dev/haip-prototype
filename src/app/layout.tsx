import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700", "800"] });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["500"] });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_TAGLINE,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
};

export const viewport: Viewport = {
  themeColor: "#f5efe4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-paper-2 sm:py-6">
        {/* phone-width column; on desktop it floats like a device */}
        <div className="grain relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-paper sm:min-h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-[2.2rem] sm:border-2 sm:border-ink sm:shadow-[8px_8px_0_0_var(--ink)]">
          {children}
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
