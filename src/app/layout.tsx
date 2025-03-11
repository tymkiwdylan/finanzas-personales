import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BudgetProvider } from "@/context/BudgetContext";
import ClientPWAWrapper from "@/components/ClientPWAWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ControlCash",
  description: "Aplicación para gestionar presupuestos personales mensuales",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ControlCash",
    startupImage: [
      '/icons-png/icon-512x512.png',
    ],
  },
  applicationName: "ControlCash",
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0284c7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* AuthProvider wrapper is still needed for the entire app, but no auth check here */}
        <AuthProvider>
          <BudgetProvider>
            {children}
            <ClientPWAWrapper />
          </BudgetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
