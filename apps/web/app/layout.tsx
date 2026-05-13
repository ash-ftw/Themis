import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Themis",
  description: "Indian legal aid, legal knowledge, and case support platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
