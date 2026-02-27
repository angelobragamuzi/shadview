import type { Metadata } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: {
    default: "ShadBoard | Gestão Urbana Inteligente",
    template: "%s | ShadBoard",
  },
  description:
    "Plataforma inteligente de gestão de demandas urbanas para prefeituras e órgãos públicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${publicSans.variable} ${sourceSerif.variable} bg-background font-sans text-foreground antialiased`}
      >
        <AppProviders>
          <SiteHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
