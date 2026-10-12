import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Productivity Suite | Notion + Jira + Linear Replacement",
  description:
    "Unified agile and productivity suite featuring Kanban & Sprint boards, Notion-style block editor, Pomodoro deep work tracker, Infinite canvas whiteboard, and interactive Gantt timeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070b14] text-slate-100 overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
