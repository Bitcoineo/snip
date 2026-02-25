import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
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

const themeScript = `
(function(){
  var t = localStorage.getItem('theme');
  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased`}
      >
        <nav className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Snip
          </Link>
          <ThemeToggle />
        </nav>
        {children}
        <footer className="text-center text-xs text-zinc-500 py-6">
          Built with Next.js + Turso
        </footer>
      </body>
    </html>
  );
}
