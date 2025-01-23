import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// const ibmPlexSans = localFont({
//   src: [
//     { path: "/fonts/IBMPlexSans-Regular.ttf", weight: "400", style: "normal" },
//     { path: "/fonts/IBMPlexSans-Medium.ttf", weight: "500", style: "normal" },
//     {
//       path: "/fonts/IBMPlexSans-SemiBold.ttf",
//       weight: "600",
//       style: "normal",
//     },
//     { path: "/fonts/IBMPlexSans-Bold.ttf", weight: "700", style: "normal" },
//   ],
// });

// const bebasNeue = localFont({
//   src: [
//     { path: "/fonts/BebasNeue-Regular.ttf", weight: "400", style: "normal" },
//   ],
//   variable: "--font-bebas-neue",
// });${ibmPlexSans.className} ${bebasNeue.variable}

export const metadata: Metadata = {
  title: "AI Monitoring Web Application",
  description: "Observe and monitoring your Generative AI Projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <>{children}</>
      </body>
    </html>
  );
}
