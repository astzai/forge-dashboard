import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORGE — Sport Journey OS",
  description:
    "Track gewicht, training, voeding en wekelijkse foto's. Met een AI coach die jou kent. €2/maand.",
  themeColor: "#0a0908",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FORGE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0908",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
