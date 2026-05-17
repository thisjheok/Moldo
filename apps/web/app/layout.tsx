import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moldo",
  description: "시험형 영어 말하기 연습 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
