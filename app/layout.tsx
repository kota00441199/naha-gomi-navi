import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "すっきり回収ナビ",
  description:
    "家庭ごみの写真から候補を確認し、那覇市の公式ルールで出し方を調べる学生チームの試作アプリ。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
