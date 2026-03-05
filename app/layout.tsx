import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-ibm-plex-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Shadboard - Gestão urbana",
    template: "%s | Shadboard - Gestão urbana",
  },
  icons: {
    icon: "/icon-logo.svg",
    shortcut: "/icon-logo.svg",
    apple: "/icon-logo.svg",
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
        className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} bg-background font-sans text-foreground antialiased`}
      >
        <AppProviders>
          <SiteHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

