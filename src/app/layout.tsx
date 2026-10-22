import type { Metadata } from "next";
import "./globals.css";

// Local typographic system variables for neo-noir atmosphere
const playfair = { variable: "font-serif" };
const ibmMono = { variable: "font-mono" };
const caveat = { variable: "font-handwriting" };
const rockSalt = { variable: "font-horror" };
const nosifer = { variable: "font-horror" };
const creepster = { variable: "font-horror" };
const butcherman = { variable: "font-horror" };

export const metadata: Metadata = {
  title: "Veritas Mortis — The Truth of Death",
  description:
    "A procedurally generated detective-horror game. Unravel the macabre. Confront the truth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${ibmMono.variable} ${caveat.variable} ${rockSalt.variable} ${nosifer.variable} ${creepster.variable} ${butcherman.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#050505] text-[#E8E3D9]"
      >
        {children}
      </body>
    </html>
  );
}