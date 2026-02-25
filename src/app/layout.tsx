import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Snip — URL Shortener",
  description: "Shorten URLs and track every click with analytics.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Snip — URL Shortener",
    description: "Shorten URLs and track every click with analytics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased`}
      >
        {children}
        <footer className="text-center text-xs text-zinc-600 py-6">
          Built with Next.js + Turso
        </footer>
      </body>
    </html>
  );
}
