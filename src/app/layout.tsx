import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_TAGLINE,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh font-sans sm:grid sm:place-items-center sm:bg-[#e5e5ea] sm:py-8 dark:sm:bg-[#111]">
        {/* phone-width column; on desktop it sits in a device-like frame */}
        <div
          id="app"
          className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bg sm:h-[min(932px,calc(100dvh-4rem))] sm:min-h-0 sm:overflow-y-auto sm:rounded-[44px] sm:shadow-[0_0_0_10px_#1c1c1e,0_30px_80px_rgb(0_0_0/0.35)] sm:scrollbar-none"
        >
          {children}
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
