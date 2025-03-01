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
  title: "Mi Presupuesto Personal",
  description: "Aplicación para gestionar presupuestos personales mensuales",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mi Presupuesto",
  },
  applicationName: "Mi Presupuesto Personal",
  manifest: "/manifest.json",
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
