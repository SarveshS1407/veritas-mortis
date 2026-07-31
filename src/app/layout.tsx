import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Mono, Caveat, Rock_Salt, Nosifer, Creepster, Butcherman } from "next/font/google";
import "./globals.css";

// --- Elegant document serif (headers, incident reports) ---
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

// --- Forensic typewriter mono (tables, stamps, codes) ---
const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// --- Red fountain-pen handwriting (detective notes & main menu) ---
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// --- Dying-blood horror script ("VERITAS MORTIS" title reveal) ---
const rockSalt = Rock_Salt({
  variable: "--font-rock-salt",
  subsets: ["latin"],
  weight: "400",
});

// --- Hyper-Realistic Blood Script ---
const nosifer = Nosifer({
  variable: "--font-nosifer",
  subsets: ["latin"],
  weight: "400",
});

// --- Alternative Horror Script ---
const creepster = Creepster({
  variable: "--font-creepster",
  subsets: ["latin"],
  weight: "400",
});

// --- Heavy Horror Script ---
const butcherman = Butcherman({
  variable: "--font-butcherman",
  subsets: ["latin"],
  weight: "400",
});

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