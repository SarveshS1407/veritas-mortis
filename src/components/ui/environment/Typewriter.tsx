"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

/** Simulates typing through a string, returning the progressively growing substring */
function useTypingEffect(text: string, speed = 90, loop = true, pauseMs = 3000) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause">("typing");
  const idx = useRef(0);

  useEffect(() => {
    if (phase === "typing") {
      if (idx.current >= text.length) {
        if (loop) { setPhase("pause"); return; }
        return;
      }
      const t = setTimeout(() => {
        idx.current += 1;
        setDisplayed(text.slice(0, idx.current));
      }, speed + Math.random() * 40 - 20);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        idx.current = 0;
        setDisplayed("");
        setPhase("typing");
      }, pauseMs);
      return () => clearTimeout(t);
    }
  }, [displayed, phase, text, speed, loop, pauseMs]);

  return displayed;
}

const TYPEWRITER_TEXT = "TIME OF DEATH: 02:14\nVICTIM: JOHN VANCE\nCAUSE: BLUNT FORCE\nSUSPECT: UNKNOWN\nWITNESSES: NONE";

/** Proper QWERTY layout with correct key widths */
const ROWS = [
  { keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], offset: 0 },
  { keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L"], offset: 8 },
  { keys: ["Z", "X", "C", "V", "B", "N", "M"], offset: 18 },
];

/**
 * Typewriter — AAA-quality mechanical typewriter.
 * Positioned top-left corner, completely separate from notebook.
 * Paper has ultra-high-contrast text. Keys are properly contained.
 */
export const Typewriter = ({ className = "" }: { className?: string }) => {
  const typed = useTypingEffect(TYPEWRITER_TEXT, 80, true, 4000);
  const lines = typed.split("\n");

  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        top: "6%", left: "3%", width: "clamp(200px, 17vw, 240px)",
        filter: "drop-shadow(0 20px 35px rgba(0,0,0,0.95))",
      }}
    >
      {/* ── Paper Sheet (protrudes above roller) ── */}
      <div
        className="relative mx-auto mb-0 z-10"
        style={{
          width: "75%", height: "clamp(90px, 9vw, 110px)",
          backgroundColor: "#FFFAF0",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08), 0 -4px 8px rgba(0,0,0,0.6)",
          borderRadius: "2px 2px 0 0",
          overflow: "hidden",
        }}
      >
        {/* Subtle paper texture */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(150,180,255,0.08) 12px, rgba(150,180,255,0.08) 13px)",
          }} />
        {/* Margin line */}
        <div className="absolute top-0 bottom-0 left-[14%] w-[1px]" style={{ backgroundColor: "rgba(255,100,100,0.25)" }} />
        {/* Typed content */}
        <div className="absolute inset-0 px-2 pt-2 pb-1 overflow-hidden"
          style={{ fontSize: "clamp(5px, 0.7vw, 7.5px)", fontFamily: "'Courier New', monospace", lineHeight: "1.6", letterSpacing: "0.06em" }}>
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre leading-tight"
              style={{ color: "#0A0A0A", fontWeight: 700, minHeight: "1.6em" }}>
              {line}
              {i === lines.length - 1 && (
                <span style={{ animation: "cursor-blink 0.75s step-end infinite", color: "#0A0A0A" }}>|</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Typewriter Chassis ── */}
      <div
        className="relative z-20"
        style={{
          background: "linear-gradient(175deg, #1C1C1C 0%, #101010 45%, #0A0A0A 100%)",
          borderRadius: "6px 6px 10px 10px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.8)",
          padding: "8px 6px 10px",
        }}
      >
        {/* Roller housing */}
        <div className="relative flex justify-center mb-1">
          <div className="w-[82%] h-5 rounded-full"
            style={{
              background: "linear-gradient(180deg, #2A2A2A 0%, #181818 50%, #0E0E0E 100%)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
            {/* Roller knobs */}
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
              style={{ background: "radial-gradient(circle at 35% 35%, #3A3A3A, #111)" }} />
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
              style={{ background: "radial-gradient(circle at 35% 35%, #3A3A3A, #111)" }} />
          </div>
        </div>

        {/* Carriage return lever */}
        <div className="absolute right-1 top-6 w-3 h-8 rounded-full"
          style={{ background: "linear-gradient(90deg, #222, #111)", boxShadow: "1px 0 3px rgba(0,0,0,0.8)" }} />

        {/* ── Key Rows — properly contained ── */}
        <div className="flex flex-col gap-[3px] mt-1 px-1">
          {ROWS.map(({ keys, offset }, ri) => (
            <div key={ri} className="flex gap-[2px]" style={{ paddingLeft: `${offset}px` }}>
              {keys.map((k) => (
                <div
                  key={k}
                  className="flex items-center justify-center rounded-sm"
                  style={{
                    width: "16px", height: "14px",
                    background: "radial-gradient(circle at 40% 30%, #2E2E2E, #141414)",
                    border: "1px solid #0A0A0A",
                    boxShadow: "0 2px 0 #060606, inset 0 1px 0 rgba(255,255,255,0.07)",
                    fontSize: "6px",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#D4C8B0",
                    textShadow: "0 1px 1px rgba(0,0,0,0.9)",
                    flexShrink: 0,
                  }}
                >
                  {k}
                </div>
              ))}
            </div>
          ))}
          {/* Space bar */}
          <div className="flex justify-center mt-[2px]">
            <div className="h-[10px] rounded-sm"
              style={{
                width: "70%",
                background: "linear-gradient(180deg, #252525 0%, #111 100%)",
                border: "1px solid #0A0A0A",
                boxShadow: "0 2px 0 #050505",
              }} />
          </div>
        </div>
      </div>

      {/* ── Contact Shadow ── */}
      <div className="absolute bottom-[-12px] left-[5%] right-[5%] h-5 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 80%)", filter: "blur(4px)" }} />
    </div>
  );
};
