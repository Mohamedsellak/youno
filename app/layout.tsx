import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Youno — Website Intelligence Analyzer",
  description:
    "Analyze any website to extract company info, tech stack, GTM signals, and B2B SaaS fit score. Powered by AI enrichment.",
  keywords: [
    "website analyzer",
    "tech stack detection",
    "B2B SaaS",
    "company intelligence",
    "GTM signals",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
