import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Henry IV",
  description: "Henry IV command operating system for Cleanz.",
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
