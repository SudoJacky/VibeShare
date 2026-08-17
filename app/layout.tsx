import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000/";

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vibe Coding — Field Notes",
    template: "%s · Vibe Coding",
  },
  description: "AI 写得越来越快，我怎样没有失去对代码库的控制。",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "AI 写得越来越快，我怎样没有失去对代码库的控制",
    description: "从接近 230 亿 Token 的使用经历，回看 Vibe Coding 里的失控、重构和工程判断。",
  },
  twitter: {
    card: "summary",
    title: "AI 写得越来越快，我怎样没有失去对代码库的控制",
    description: "从接近 230 亿 Token 的使用经历，回看 Vibe Coding 里的失控、重构和工程判断。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" style={{ background: "#0f1517" }}>
      <body style={{ background: "#0f1517" }}>{children}</body>
    </html>
  );
}
