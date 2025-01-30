"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/AppSidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar onSidebarToggle={setSidebarOpen} defaultOpen={true} />
          <div className="flex flex-col flex-1">
            <NavBar />
            <main
              className={cn(
                "flex-1 p-4 transition-all duration-300  overflow-y-auto ",
                "lg:ml-2",
                isSidebarOpen ? "ml-60" : "ml-20"
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
