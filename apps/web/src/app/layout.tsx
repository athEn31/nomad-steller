import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Physics Platform",
  description: "Interactive Physics Simulations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f5f5f7] text-[#1d1d1f]">
        {children}
      </body>
    </html>
  );
}
