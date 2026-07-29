import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const imageUrl = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Vibe Coding — Field Notes",
      template: "%s · Vibe Coding",
    },
    description: "AI 写得越来越快，我怎样没有失去对代码库的控制。",
    openGraph: {
      type: "website",
      url: origin,
      title: "AI 写得越来越快，我怎样没有失去对代码库的控制",
      description: "一场关于速度、控制与工程判断的 Vibe Coding 分享。",
      images: [{ url: imageUrl, width: 1672, height: 941 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "AI 写得越来越快，我怎样没有失去对代码库的控制",
      description: "一场关于速度、控制与工程判断的 Vibe Coding 分享。",
      images: [imageUrl],
    },
  };
}

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
