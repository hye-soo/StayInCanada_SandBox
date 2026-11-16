import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/app-header.tsx";
import { getSessionUser } from "@/lib/firebase/session.ts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowOui",
  description: "Your immigration application, step by step",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  const headerUser = user
    ? { role: user.role, name: user.displayName || user.email?.split("@")[0] || "Account" }
    : null;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppHeader user={headerUser} />
        {children}
      </body>
    </html>
  );
}
