import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finding Memory — AI Discovery Engine",
  description:
    "Researching how people retrieve visual information when memory is incomplete.",
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
