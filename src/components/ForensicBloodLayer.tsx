"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ForensicBloodLayerProps {
  /** Trigger boolean to start the gunshot shockwave and fluid dripping sequence */
  isTriggered?: boolean;
  /** Backwards compatibility alias for isTriggered */
  trigger?: boolean;
  /** Callback fired once the fluid gravity dripping cycle completes and coagulates */
  onAnimationComplete?: () => void;
  /** Optional custom CSS classes */
  className?: string;
}

export default function ForensicBloodLayer({
  isTriggered,
  trigger,
  className = "",
}: ForensicBloodLayerProps) {
  const active = isTriggered ?? trigger ?? true;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ isolation: "isolate" }}
    >
      {/* ── INLINE SVG CAPILLARY ABSORPTION FILTER (NO EXTERNAL ASSETS) ── */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="pure-blood-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 0.85 0 0 0
                0 0 0.85 0 0
                0 0 0 0.96 0
              "
            />
          </filter>
        </defs>
      </svg>

      {/* ── PURE INLINE SVG BLOOD SPLATTERS & GRAVITY DRIPS (100% VECTOR / CSS) ── */}
      <AnimatePresence>
        {active && (
          <motion.svg
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            style={{
              mixBlendMode: "multiply",
              filter: "url(#pure-blood-bleed)",
            }}
          >
            {/* 1. Primary Central Clotted Pool & Impact Mass */}
            <motion.path
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.95, scale: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              d="M 320,320 C 350,290 410,270 470,300 C 530,330 580,310 610,340 C 640,370 600,420 560,435 C 510,450 460,460 410,455 C 360,450 320,430 300,390 C 280,350 290,340 320,320 Z"
              fill="#1c0202"
            />
            <motion.path
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 0.92, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              d="M 275,340 C 308,295 372,308 432,324 C 492,340 545,358 522,412 C 502,452 442,468 382,462 C 328,456 268,432 258,382 C 248,338 258,360 275,340 Z"
              fill="#290303"
            />
            <motion.path
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.88, scale: 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              d="M 345,310 C 388,278 472,288 515,328 C 545,362 525,422 485,442 C 442,462 382,452 342,416 C 310,382 318,335 345,310 Z"
              fill="#3c0505"
            />

            {/* 2. Top-Left Upward Spray Fan */}
            <motion.g
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 0.92, x: 0, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              fill="#2c0303"
            >
              <path d="M 340,320 C 310,270 240,210 180,160 C 175,155 185,150 195,155 C 250,200 320,260 350,310 Z" />
              <path d="M 300,300 C 260,240 190,170 130,110 C 125,105 135,100 145,105 C 200,160 270,230 310,290 Z" />
              <ellipse cx="140" cy="115" rx="5.5" ry="12" transform="rotate(-40 140 115)" />
              <ellipse cx="110" cy="95" rx="3.8" ry="8.5" transform="rotate(-45 110 95)" />
              <ellipse cx="90" cy="65" rx="2.8" ry="6.5" transform="rotate(-50 90 65)" />
              <ellipse cx="160" cy="140" rx="4.2" ry="9.5" transform="rotate(-35 160 140)" />
              <ellipse cx="190" cy="175" rx="5.2" ry="11.5" transform="rotate(-30 190 175)" />
              <ellipse cx="120" cy="150" rx="3.2" ry="7.5" transform="rotate(-45 120 150)" />
              <circle cx="80" cy="120" r="2.8" />
              <circle cx="100" cy="80" r="2.2" />
              <circle cx="65" cy="50" r="2" />
              <circle cx="130" cy="70" r="2.4" />
            </motion.g>

            {/* 3. Top-Right Upward Spray Fan */}
            <motion.g
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 0.9, x: 0, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              fill="#320404"
            >
              <path d="M 580,330 C 650,260 740,190 830,130 C 835,125 845,130 840,138 C 760,195 670,265 600,340 Z" />
              <ellipse cx="830" cy="135" rx="4.8" ry="11.5" transform="rotate(45 830 135)" />
              <ellipse cx="860" cy="110" rx="3.8" ry="9.2" transform="rotate(50 860 110)" />
              <ellipse cx="890" cy="80" rx="2.8" ry="7.2" transform="rotate(55 890 80)" />
              <ellipse cx="800" cy="165" rx="4.2" ry="9.5" transform="rotate(40 800 165)" />
              <circle cx="850" cy="90" r="2.2" />
              <circle cx="880" cy="65" r="2" />
              <circle cx="910" cy="50" r="1.6" />
              <circle cx="820" cy="120" r="2.4" />
            </motion.g>

            {/* 4. Realistic Dynamic Downward Gravity Drips (Animated Clip-Path Flow) */}
            {/* Drip 1: Main Prominent Long Drip (X: ~372, Y: 375 down to 820) */}
            <motion.g
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.4, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
              fill="#180101"
            >
              <path d="M 368,375 C 367,460 366,550 368,640 C 369,690 370,740 371,795 C 364,797 361,805 363,814 C 365,823 376,827 381,821 C 386,815 383,803 377,796 C 375,740 373,690 372,640 C 371,550 372,460 376,375 Z" />
              <circle cx="372" cy="810" r="6.2" />
              <circle cx="370" cy="808" r="2" fill="rgba(255,235,220,0.45)" />
            </motion.g>

            {/* Drip 2: Left Drip (X: ~142, Y: 375 to 550) */}
            <motion.g
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
              fill="#260303"
            >
              <path d="M 140,375 C 139,420 140,470 141,520 C 136,523 135,530 137,537 C 139,544 148,546 151,540 C 154,534 150,525 145,521 C 144,470 143,420 144,375 Z" />
              <circle cx="143" cy="533" r="4.8" />
              <circle cx="141.5" cy="531.5" r="1.6" fill="rgba(255,235,220,0.45)" />
            </motion.g>

            {/* Drip 3: Center-Left Medium Drip (X: ~308, Y: 405 to 610) */}
            <motion.g
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.0, delay: 0.22, ease: [0.25, 1, 0.5, 1] }}
              fill="#1d0202"
            >
              <path d="M 306,405 C 305,460 307,515 308,575 C 303,578 302,586 304,593 C 307,600 316,602 319,595 C 322,588 317,580 312,576 C 311,515 309,460 310,405 Z" />
              <circle cx="310" cy="587" r="5.2" />
              <circle cx="308.5" cy="585.5" r="1.8" fill="rgba(255,235,220,0.45)" />
            </motion.g>

            {/* Drip 4: Center Drip (X: ~435, Y: 405 to 625) */}
            <motion.g
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.05, delay: 0.18, ease: [0.25, 1, 0.5, 1] }}
              fill="#220202"
            >
              <path d="M 433,405 C 432,470 434,535 435,595 C 430,598 429,606 431,613 C 434,620 443,622 446,615 C 449,608 444,600 439,596 C 438,535 436,470 437,405 Z" />
              <circle cx="437" cy="607" r="5" />
              <circle cx="435.5" cy="605.5" r="1.6" fill="rgba(255,235,220,0.45)" />
            </motion.g>

            {/* Drip 5: Center-Right Drip (X: ~508, Y: 380 to 670) */}
            <motion.g
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.15, delay: 0.25, ease: [0.25, 1, 0.5, 1] }}
              fill="#1e0202"
            >
              <path d="M 506,380 C 505,460 507,545 508,635 C 502,638 501,647 504,655 C 507,663 518,665 521,657 C 524,649 518,640 512,636 C 511,545 509,460 510,380 Z" />
              <circle cx="511" cy="649" r="5.4" />
              <circle cx="509.5" cy="647" r="1.8" fill="rgba(255,235,220,0.45)" />
            </motion.g>

            {/* Drip 6: Right Stamp-Frame Drip (X: ~708, Y: 355 to 495) */}
            <motion.g
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.25, 1, 0.5, 1] }}
              fill="#2b0303"
            >
              <path d="M 706,355 C 705,395 706,440 707,475 C 703,478 702,484 704,490 C 706,496 714,497 717,492 C 719,486 716,480 711,476 C 710,440 709,395 710,355 Z" />
              <circle cx="709" cy="485" r="4.4" />
              <circle cx="707.5" cy="483.5" r="1.5" fill="rgba(255,235,220,0.4)" />
            </motion.g>

            {/* Drip 7: Far Right Drip (X: ~885, Y: 380 to 635) */}
            <motion.g
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
              fill="#360505"
            >
              <path d="M 883,380 C 882,450 884,520 885,595 C 880,598 879,606 881,613 C 884,620 893,621 896,615 C 898,608 894,600 889,596 C 888,520 886,450 887,380 Z" />
              <circle cx="887" cy="607" r="4.6" />
              <circle cx="885.5" cy="605.5" r="1.5" fill="rgba(255,235,220,0.4)" />
            </motion.g>

            {/* 5. Clotted Radial Arterial Spines & Filaments */}
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.88, scale: 1 }}
              transition={{ duration: 0.25 }}
              stroke="#1f0202"
              strokeLinecap="round"
            >
              <line x1="380" y1="360" x2="260" y2="460" strokeWidth="2.6" />
              <line x1="420" y1="370" x2="480" y2="490" strokeWidth="2.2" />
              <line x1="450" y1="360" x2="570" y2="460" strokeWidth="2.4" />
              <line x1="360" y1="340" x2="220" y2="380" strokeWidth="2.2" />
              <line x1="480" y1="330" x2="650" y2="350" strokeWidth="2.5" />
            </motion.g>

            {/* 6. Satellite Micro-Mist & Droplet Clusters */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              fill="#280303"
            >
              <circle cx="280" cy="480" r="3.6" />
              <circle cx="240" cy="510" r="2.9" />
              <circle cx="220" cy="430" r="4.2" />
              <circle cx="190" cy="460" r="3.4" />
              <circle cx="560" cy="480" r="4.4" />
              <circle cx="620" cy="510" r="3.2" />
              <circle cx="660" cy="470" r="2.6" />
              <circle cx="730" cy="420" r="3.6" />
              <circle cx="810" cy="410" r="3" />
              <circle cx="380" cy="850" r="3.6" />
              <circle cx="375" cy="875" r="2.4" />
              <circle cx="515" cy="690" r="3.2" />
              <circle cx="440" cy="645" r="2.8" />
              <circle cx="314" cy="625" r="2.9" />
              <circle cx="146" cy="565" r="2.5" />
              <circle cx="890" cy="645" r="2.6" />
            </motion.g>
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}
