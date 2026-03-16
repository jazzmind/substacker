import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Substacker",
  description: "Manage and grow expert-driven Substacks with AI-powered research, interviews, and publishing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const portalUrl = process.env.NEXT_PUBLIC_BUSIBOX_PORTAL_URL || process.env.NEXT_PUBLIC_AI_PORTAL_URL || '';
  const appId = process.env.APP_NAME || 'substacker';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const portalBasePath = process.env.NEXT_PUBLIC_PORTAL_BASE_PATH || '/portal';

  const checkIntervalMs = process.env.NEXT_PUBLIC_AUTH_CHECK_INTERVAL_MS
    ? parseInt(process.env.NEXT_PUBLIC_AUTH_CHECK_INTERVAL_MS, 10)
    : undefined;
  const refreshBufferMs = process.env.NEXT_PUBLIC_AUTH_REFRESH_BUFFER_MS
    ? parseInt(process.env.NEXT_PUBLIC_AUTH_REFRESH_BUFFER_MS, 10)
    : undefined;
  const tokenExpiresOverrideMs = process.env.NEXT_PUBLIC_TOKEN_EXPIRES_OVERRIDE_MS
    ? parseInt(process.env.NEXT_PUBLIC_TOKEN_EXPIRES_OVERRIDE_MS, 10)
    : undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers
          appId={appId}
          portalUrl={portalUrl}
          basePath={basePath}
          portalBasePath={portalBasePath}
          checkIntervalMs={checkIntervalMs}
          refreshBufferMs={refreshBufferMs}
          tokenExpiresOverrideMs={tokenExpiresOverrideMs}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
