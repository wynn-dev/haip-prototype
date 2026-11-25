import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Device } from "@/components/device";
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
      <body className="min-h-dvh font-sans sm:flex sm:min-h-dvh sm:items-center sm:justify-center sm:py-4 sm:bg-[radial-gradient(120%_80%_at_50%_0%,#f4f4f7_0%,#dcdce2_100%)] dark:sm:bg-[radial-gradient(120%_80%_at_50%_0%,#1c1c1f_0%,#050506_100%)]">
        <Device>{children}</Device>
      </body>
    </html>
  );
}
