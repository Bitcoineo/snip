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
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-extrabold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
            Snip
          </Link>
          <ThemeToggle />
        </nav>
        <div className="animate-fade-in">
          {children}
        </div>
        <footer className="text-center text-xs text-stone-400 dark:text-stone-600 py-8">
          Built with Next.js + Turso
        </footer>
      </body>
    </html>
  );
}
