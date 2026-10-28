import type { Metadata, Viewport } from "next";
import { Geist_Mono, Hind, Rozha_One } from "next/font/google";
import { PlayerProvider } from "@/components/player/player-provider";
import { ThemeProvider } from "@/components/theme";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_NAME } from "@/lib/config";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

// Hind (body) and Rozha One (display) both cover Devanagari, so lyrics in Hindi script render properly
const sans = Hind({ variable: "--font-sans", subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"] });
const display = Rozha_One({ variable: "--font-display", subsets: ["latin", "devanagari"], weight: "400" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} — Bhojpuri AI music`, template: `%s · ${SITE_NAME}` },
  description:
    "Create Bhojpuri songs from your lyrics, make new songs in the style of a track you love, and download any song as a single MP3 or as stems.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#141a3a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the theme class before hydration, hence suppressHydrationWarning
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SessionProvider>
            <TooltipProvider delayDuration={300}>
              <PlayerProvider>{children}</PlayerProvider>
            </TooltipProvider>
          </SessionProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
