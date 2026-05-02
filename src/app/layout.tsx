import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORGE — Sport Journey OS",
  description: "Personal fitness, training and nutrition dashboard with AI coach.",
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
