import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Pixelify_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Retro 98 theme
const pixelify = Pixelify_Sans({ variable: "--font-pixelify", subsets: ["latin"] });
// Hyprland theme
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PortfoliOS — Pradyum Mistry",
  description:
    "Pradyum Mistry's portfolio as a working operating system: three switchable desktops (Golden Gate, Retro 98, Hyprland), a phone OS, and a 3D room to explore.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pixelify.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
