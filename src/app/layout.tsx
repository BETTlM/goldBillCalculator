import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Titan Gold — Jewellery Price Calculator",
  description: "Calculate gold jewellery prices with live 24K gold rates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
