import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speaking Practice",
  description: "Structured speaking exam-style practice with AI feedback.",
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
