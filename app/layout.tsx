import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Henry IV",
  title: {
    default: "Henry IV",
    template: "%s | Henry IV",
  },
  description: "A mobile-ready command website for Cleanz, Cedar Neck Realty, and the founder's Health OS.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Henry IV",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "Henry IV",
    description: "Voice-first operating partner for sales, acquisitions, and personal systems.",
    siteName: "Henry IV",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#030303",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
