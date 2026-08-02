"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import DistressedBloodStamp from "./DistressedBloodStamp";

type Stage = "desk" | "spread" | "menu";

// ─────────────────────────────────────────────────────────────────────────────
// Web Audio Engine — no siren, replaced with subtle atmospheric drone
// ─────────────────────────────────────────────────────────────────────────────
function useAudio() {
  const ctx = useRef<AudioContext | null>(null);

  const ac = useCallback((): AudioContext => {
    if (!ctx.current) {
      const C = window.AudioContext || (window as any).webkitAudioContext;
      ctx.current = new C();
    }
    return ctx.current;
  }, []);

  /**
   * Ultra-low ambient drone — barely perceptible tension builder.
   * Two detuned sine oscillators + filtered noise at 2% volume.
   * Returns a stop() function.
   */
  const startAmbient = useCallback(() => {
    const a = ac();
    const now = a.currentTime;

    // Master output gain — kept very low
    const master = a.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.018, now + 3.0); // fade in slowly
    master.connect(a.destination);

    // Drone osc 1 — 48 Hz sub rumble
    const o1 = a.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 48;
    const g1 = a.createGain(); g1.gain.value = 0.6;
    o1.connect(g1); g1.connect(master);
    o1.start();

    // Drone osc 2 — 52 Hz (slightly detuned for beat frequency "throb")
    const o2 = a.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 52;
    const g2 = a.createGain(); g2.gain.value = 0.5;
    o2.connect(g2); g2.connect(master);
    o2.start();

    // Very quiet low-pass filtered noise (distant wind/rain ambiance)
    const bufSize = a.sampleRate * 4;
    const nBuf = a.createBuffer(1, bufSize, a.sampleRate);
    const nd = nBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nd[i] = (Math.random() * 2 - 1);
    const noise = a.createBufferSource();
    noise.buffer = nBuf; noise.loop = true;
    const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 180;
    const gn = a.createGain(); gn.gain.value = 0.25;
    noise.connect(lp); lp.connect(gn); gn.connect(master);
    noise.start();

    return () => {
      master.gain.linearRampToValueAtTime(0, a.currentTime + 1.2);
      setTimeout(() => {
        try { o1.stop(); o2.stop(); noise.stop(); } catch (_) {}
      }, 1400);
    };
  }, [ac]);

  /** Heavy folder slap */
  const folderSlap = useCallback(() => {
    const a = ac(); const now = a.currentTime;
    const len = a.sampleRate * 0.6;
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4) * (i < 600 ? i / 600 : 1);
    const src = a.createBufferSource(); src.buffer = buf;
    const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 650;
    const g = a.createGain();
    g.gain.setValueAtTime(1.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    src.connect(lp); lp.connect(g); g.connect(a.destination);
    src.start(now); src.stop(now + 0.6);
  }, [ac]);

  /** Paper page turn */
  const pageTurn = useCallback(() => {
    const a = ac(); const now = a.currentTime;
    const len = a.sampleRate * 0.5;
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = i < len * 0.12 ? i / (len * 0.12) : 1 - (i - len * 0.12) / (len * 0.88);
      d[i] = (Math.random() * 2 - 1) * env * 0.45;
    }
    const src = a.createBufferSource(); src.buffer = buf;
    const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2800;
    const g = a.createGain(); g.gain.value = 0.7;
    src.connect(hp); hp.connect(g); g.connect(a.destination);
    src.start(now); src.stop(now + 0.5);
  }, [ac]);

  /** Suppressed gunshot */
  const gunshot = useCallback(() => {
    const a = ac(); const now = a.currentTime;
    const bLen = a.sampleRate * 0.12;
    const buf = a.createBuffer(1, bLen, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bLen; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bLen, 1.05);
    const crack = a.createBufferSource(); crack.buffer = buf;
    const g1 = a.createGain();
    g1.gain.setValueAtTime(1.6, now); g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    crack.connect(g1); g1.connect(a.destination); crack.start(now); crack.stop(now + 0.12);
    const osc = a.createOscillator(); osc.type = "sine";
    osc.frequency.setValueAtTime(95, now); osc.frequency.exponentialRampToValueAtTime(12, now + 0.85);
    const g2 = a.createGain();
    g2.gain.setValueAtTime(1.2, now); g2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc.connect(g2); g2.connect(a.destination); osc.start(now); osc.stop(now + 0.85);
  }, [ac]);

  /** Wet splatter */
  const splatter = useCallback(() => {
    const a = ac(); const now = a.currentTime;
    const len = a.sampleRate * 0.65;
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const ramp = i < len * 0.04 ? i / (len * 0.04) : 1;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 0.5) * ramp * 1.0;
    }
    const src = a.createBufferSource(); src.buffer = buf;
    const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1050;
    const g = a.createGain(); g.gain.value = 1.1;
    src.connect(lp); lp.connect(g); g.connect(a.destination);
    src.start(now); src.stop(now + 0.65);
  }, [ac]);

  return { startAmbient, folderSlap, pageTurn, gunshot, splatter };
}

// Drip column positions across the title width
const TITLE_DRIP_COLS = [5, 12, 20, 28, 36, 45, 53, 62, 70, 78, 87, 94];
// Menu drip positions (one per menu item, at different x offsets)
const MENU_DRIPS = [
  [10, 25, 45, 68],   // BEGIN INVESTIGATION
  [15, 32, 58],       // RESUME DOSSIER
  [8, 22, 40, 65, 82],// REPLAY SEEDS
  [18, 40, 70],       // SYSTEM LOGS
];

export default function CaseFileOpeningSequence() {
  const [isMounted, setIsMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("desk");
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBlood, setShowBlood] = useState(false);
  const [showDrips, setShowDrips] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuHover, setMenuHover] = useState<number | null>(null);
  const [fileHover, setFileHover] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const stopAmbientRef = useRef<(() => void) | null>(null);

  const audio = useAudio();

  // Start ambient drone on mount (after first user interaction via click on the page)
  // We start it on mount but it only activates after user gesture
  useEffect(() => {
    setIsMounted(true);
    const startOnInteract = () => {
      if (!stopAmbientRef.current) {
        const stop = audio.startAmbient();
        stopAmbientRef.current = stop;
        setAmbientOn(true);
      }
    };
    window.addEventListener("click", startOnInteract, { once: true });
    return () => window.removeEventListener("click", startOnInteract);
  }, [audio]);

  // Parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bgX = useSpring(useTransform(mx, [-0.5, 0.5], [12, -12]), { stiffness: 50, damping: 18 });
  const fileRX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 100, damping: 25 });
  const fileRY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 100, damping: 25 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== "desk") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const openFile = () => {
    if (stage !== "desk") return;
    stopAmbientRef.current?.();
    audio.folderSlap();
    mx.set(0); my.set(0);
    setStage("spread");
  };

  const flipToMenu = () => {
    if (stage !== "spread" || isFlipping) return;
    audio.pageTurn();
    setIsFlipping(true);
    setTimeout(() => audio.gunshot(), 700);
    setTimeout(() => {
      audio.splatter();
      setStage("menu");
      setShowBlood(true);
    }, 860);
    setTimeout(() => setShowDrips(true), 1100);
    setTimeout(() => setShowMenu(true), 2400);
  };

  const menuItems = [
    "BEGIN INVESTIGATION",
    "RESUME DOSSIER",
    "REPLAY SEEDS & CONFIG",
    "SYSTEM LOGS",
  ];

  return (
    <div
      onMouseMove={onMouseMove}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black select-none"
      style={{ perspective: "1600px" }}
    >
      {/* ── FOREST BACKGROUND ── */}
      <motion.div
        style={{ x: stage === "desk" ? bgX : 0, scale: 1.08 }}
        animate={{
          filter: stage !== "desk" ? "blur(18px) brightness(0.18) saturate(0.3)" : "blur(0px) brightness(0.78) saturate(0.8)",
          scale: stage !== "desk" ? 1.18 : 1.08,
        }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0"
      >
        <img src="/forest-crime-scene.jpg" alt="Crime Scene" className="w-full h-full object-cover" style={{ filter: "contrast(1.1) saturate(0.8)" }} />
      </motion.div>

      {/* Deep vignette */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_55%,transparent_5%,rgba(0,0,0,0.9)_100%)]" />

      {/* ── SIREN LIGHT EFFECTS (visual only, no sound) ── */}
      {stage === "desk" && (
        <>
          {/* Blue flash — top left */}
          <motion.div
            animate={{ opacity: [0, 0.5, 0, 0, 0, 0.4, 0, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-0 z-1"
            style={{ background: "radial-gradient(ellipse at 12% 8%, rgba(40,100,255,0.75) 0%, transparent 55%)" }}
          />
          {/* Red flash — top right */}
          <motion.div
            animate={{ opacity: [0, 0, 0, 0.5, 0, 0, 0, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-0 z-1"
            style={{ background: "radial-gradient(ellipse at 88% 8%, rgba(220,30,30,0.75) 0%, transparent 55%)" }}
          />
        </>
      )}

      {/* Rain particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {isMounted && [...Array(25)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: ["0%", "110%"], opacity: [0, 0.25, 0] }}
            transition={{ duration: 0.7 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() * 3, ease: "linear" }}
            className="absolute bg-blue-100/20 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: "-3%", width: "1px", height: `${10 + Math.random() * 14}px`, transform: "rotate(12deg)" }}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════
           STAGE 1: THE LARGE FILE FOLDER ON DESK
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {stage === "desk" && (
          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -60, rotateX: 10 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ rotateX: fileRX, rotateY: fileRY }}
            className="relative z-30 flex flex-col items-center gap-5"
          >
            {/* Caption */}
            <motion.div
              animate={{ opacity: [0.8, 1, 0.8], y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-center pointer-events-none px-4"
            >
              <p className="font-serif text-sm md:text-base lg:text-lg tracking-[0.28em] text-[#D4C5A9] uppercase font-bold drop-shadow-[0_0_24px_rgba(212,197,169,0.5)]">
                &ldquo;Unseal the Dossier. Expose the Truth Before It Dies.&rdquo;
              </p>
            </motion.div>

            {/* THE FILE */}
            <motion.div
              onHoverStart={() => setFileHover(true)}
              onHoverEnd={() => setFileHover(false)}
              onClick={openFile}
              whileHover={{ scale: 1.022 }}
              className="relative cursor-pointer"
              style={{ width: "clamp(400px, 30vw, 540px)" }}
            >
              <AnimatePresence>
                {fileHover && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute -inset-10 z-0 rounded-xl bg-amber-500 blur-3xl opacity-30 pointer-events-none" />
                )}
              </AnimatePresence>

              {/* FOLDER BODY — solid warm brown, no grainy overlay */}
              <div
                className="relative rounded-sm overflow-hidden"
                style={{
                  height: "clamp(560px, 48vw, 740px)",
                  background: "linear-gradient(170deg, #B07840 0%, #9A6830 35%, #855820 65%, #6E4418 100%)",
                  boxShadow: "0 40px 90px rgba(0,0,0,0.97), inset 0 0 60px rgba(0,0,0,0.45), inset 3px 0 10px rgba(255,190,80,0.06)",
                }}
              >
                {/* Coffee ring top-right */}
                <div className="absolute top-7 right-10 w-28 h-28 rounded-full border-[7px] border-[#3A2010]/45 pointer-events-none" />
                <div className="absolute top-14 right-16 w-14 h-14 rounded-full border-[4px] border-[#3A2010]/25 pointer-events-none" />
                {/* Second coffee ring */}
                <div className="absolute top-60 left-8 w-20 h-20 rounded-full border-[5px] border-[#3A2010]/20 pointer-events-none" />

                {/* Horizontal crease */}
                <div className="absolute left-4 right-0 top-[52%] h-[1.5px] bg-[#5A3818]/35 pointer-events-none" />

                {/* Metallic Paperclip SVG */}
                <div className="absolute -top-5 left-20 z-20">
                  <svg width="26" height="90" viewBox="0 0 26 90" fill="none">
                    <path d="M13 5 Q5 5 5 14 L5 78 Q5 86 13 86 Q21 86 21 78 L21 22 Q21 15 13 15 Q5 15 5 22 L5 78"
                      stroke="#BEBEBE" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M13 5 Q21 5 21 14 L21 78" stroke="#E0E0E0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>

                {/* Spine shadow */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#2A1008]/80 to-transparent pointer-events-none" />

                {/* CONTENT */}
                <div className="relative ml-6 h-full flex flex-col px-8 pt-8 pb-8">

                  {/* File Number Box — top right */}
                  <div className="absolute top-5 right-5 border-[3px] border-[#1A0A04]/90 bg-[#7A4818]/30 px-4 py-2.5">
                    <p className="font-mono text-[12px] font-black tracking-[0.2em] text-[#0E0804] uppercase">File No. ___________</p>
                    <p className="font-mono text-[9px] font-black text-[#0E0804]/70 tracking-widest mt-0.5">UNRESOLVED EVIDENCE</p>
                  </div>

                  {/* Agency SVG Emblem — cream badge for max contrast on brown folder */}
                  <div className="flex flex-col items-center mt-4 mb-4">
                    {/* Black backing panel so the logo pops as a dark sinister emblem */}
                    <div className="relative bg-black rounded-full p-3 shadow-[0_4px_16px_rgba(0,0,0,0.8)] border border-red-900/50">
                      <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
                        {/* Outer dashed ring */}
                        <circle cx="50" cy="50" r="46" stroke="#cc0000" strokeWidth="2.5" strokeDasharray="5 2" />
                        {/* Inner solid ring */}
                        <circle cx="50" cy="50" r="38" stroke="#cc0000" strokeWidth="1.8" />
                        {/* Shield */}
                        <path d="M50 16 L73 29 L73 58 Q73 76 50 84 Q27 76 27 58 L27 29Z"
                          stroke="#cc0000" strokeWidth="2.2" fill="#5a0000" fillOpacity="0.3" />
                        {/* Scales of Justice beam */}
                        <line x1="50" y1="27" x2="50" y2="68" stroke="#cc0000" strokeWidth="2" />
                        <line x1="30" y1="41" x2="70" y2="41" stroke="#cc0000" strokeWidth="2" />
                        {/* Left scale pan */}
                        <path d="M29 41 L21 57 Q29 62 37 57Z" stroke="#cc0000" strokeWidth="1.5" fill="#cc0000" fillOpacity="0.8" />
                        {/* Right scale pan */}
                        <path d="M71 41 L63 57 Q71 62 79 57Z" stroke="#cc0000" strokeWidth="1.5" fill="#cc0000" fillOpacity="0.8" />
                        {/* Star top */}
                        <polygon points="50,10 52,16 58,16 53,20 55,26 50,22 45,26 47,20 42,16 48,16" fill="#ff0000" opacity="1" />
                        {/* Arc label */}
                        <path id="arc" d="M 15 55 A 36 36 0 0 1 85 55" fill="none" />
                        <text fontSize="5.5" fill="#cc0000" fontWeight="900" fontFamily="monospace">
                          <textPath href="#arc" startOffset="8%">FORENSIC PATHOLOGY · DIV. 09</textPath>
                        </text>
                      </svg>
                    </div>
                    <p className="font-mono text-[11px] font-black tracking-[0.1em] text-[#1E0C04] uppercase mt-2 text-center">
                      Dept. of Forensic Pathology &amp; Criminal Investigation
                    </p>
                    <p className="font-mono text-[10px] font-black tracking-[0.16em] text-[#1E0C04]/80 uppercase mt-0.5">Division 09 — Authorized Personnel Only</p>
                  </div>

                  {/* Typewritten Info Box */}
                  <div className="border-[3px] border-[#1A0A04]/80 bg-[#7A4818]/15 p-5 mb-4">
                    <p className="font-mono text-[10px] font-black tracking-[0.2em] text-[#0E0804] border-b-2 border-[#1A0A04]/40 pb-2 mb-3 uppercase">Case Classification</p>
                    {[
                      ["Name:", ""],
                      ["Address:", ""],
                      ["Subject:", "VERITAS MORTIS CASE"],
                      ["From:", "DEPT. 09"],
                      ["To:", "EYES ONLY"],
                      ["Date Filed:", ""],
                      ["Case Status:", "ACTIVE — UNRESOLVED"],
                    ].map(([label, val], i) => (
                      <div key={i} className="flex items-end gap-2 mb-2.5">
                        <span className="font-mono text-[11px] font-black text-[#0E0804] whitespace-nowrap uppercase">{label}</span>
                        {val ? (
                          <span className="font-mono text-[11px] font-black text-[#0E0804]">{val}</span>
                        ) : (
                          <div className="flex-1 border-b-2 border-[#1A0A04]/50" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Evidence summary box — extra content */}
                  <div className="border-2 border-[#1A0A04]/60 bg-[#7A4818]/10 p-3 mb-4">
                    <p className="font-mono text-[10px] font-black tracking-[0.18em] text-[#0E0804] border-b border-[#1A0A04]/30 pb-1.5 mb-2 uppercase">Evidence Summary</p>
                    {[
                      "Victims: 2 confirmed, 1 unknown",
                      "Suspects: 4 persons of interest",
                      "Physical Evidence: 14 items tagged",
                      "Blood Samples: Analyzed — O+/Contaminated",
                      "Location: Forest Grid E7 — Secured",
                    ].map((line, i) => (
                      <p key={i} className="font-mono text-[9px] font-bold text-[#1A0804] leading-5">· {line}</p>
                    ))}
                  </div>

                  {/* Bottom Stamp */}
                  <div className="mt-auto border-[3px] border-[#1A0A04]/80 bg-[#7A4818]/15 py-3 px-4 text-center">
                    <p className="font-mono text-[12px] font-black tracking-[0.15em] text-[#0E0804] uppercase">
                      Department of Forensic Pathology
                    </p>
                    <div className="border-t-[3px] border-[#1A0A04]/50 my-2" />
                    <p className="font-mono text-[15px] font-black tracking-widest text-[#5A0000] uppercase">FILE NO. 900</p>
                    <p className="font-mono text-[9px] font-black tracking-[0.3em] text-[#1A0A04]/60 mt-1">DOSSIER #77-B / UNRESOLVED EVIDENCE MATRIX</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.p
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="font-mono text-[11px] font-bold tracking-[0.5em] text-[#D4C5A9]/80 uppercase"
            >
              [ Click the Case File to Open Evidence ]
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
           STAGES 2 & 3: OPEN DOSSIER
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {(stage === "spread" || stage === "menu") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 80, rotateX: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-3 md:inset-6 z-30 flex shadow-[0_50px_120px_rgba(0,0,0,0.98)]"
            style={{ perspective: "2200px" }}
          >
              {/* ── LEFT PAGE (Evidence Log) ── */}
              <div className="relative w-1/2 h-full bg-[#EDE8D5] rounded-l-sm overflow-hidden border border-black/10 shadow-[inset_-10px_0_24px_rgba(0,0,0,0.3)] z-10">
                <div className="relative w-full h-full p-6 md:p-8 flex flex-col">
                  <div className="relative z-30 flex justify-between items-end border-b-[3px] border-[#1A1817] pb-2 mb-4 bg-[#EDE8D5]/80 backdrop-blur-sm shrink-0">
                    <div>
                      <h2 className="font-serif text-3xl tracking-[0.18em] font-black text-[#1A1817] uppercase">Evidence Log</h2>
                      <p className="font-mono text-[11px] font-black tracking-widest text-[#3A2818]">DEPT.09 · CASE #77-B · FORENSIC DIVISION</p>
                    </div>
                    <p className="font-mono text-[11px] font-black text-[#1A1817]">PAGE 1 / 3</p>
                  </div>

                  {/* Grid Layout for non-overlapping content */}
                  <div className="relative flex-1 grid grid-cols-2 gap-4 z-20">
                    
                    {/* Top Left: Threat Note */}
                    <div className="bg-white/95 border border-red-950 p-2 shadow-md rotate-[-2deg]">
                      <div className="w-full aspect-[4/3] overflow-hidden mb-1">
                        <img src="/threat-note.jpg" alt="Threat Note" className="w-full h-full object-cover contrast-125" />
                      </div>
                      <p className="font-mono text-[8px] text-center text-red-950 font-black uppercase">EVIDENCE #11</p>
                    </div>

                    {/* Top Right: Coroner Report & Table */}
                    <div className="row-span-2 bg-white/95 border-[2px] border-[#1A1817] p-3 shadow-lg rotate-[1deg] flex flex-col">
                      <div className="w-full aspect-square overflow-hidden mb-2 border border-black/20">
                        <img src="/coroner-report.jpg" alt="Coroner Report" className="w-full h-full object-cover contrast-125 saturate-50" />
                      </div>
                      <h3 className="font-mono text-[10px] font-black border-b-[2px] border-[#1A1817] pb-1 mb-1 tracking-widest uppercase">
                        Blood Serum #4920-B
                      </h3>
                      <table className="w-full font-mono text-[8px] text-[#1A1817]">
                        <tbody>
                          {[
                            ["BLOOD TYPE", "O-POS"],
                            ["HEMOGLOBIN", "7.4 g/dL"],
                            ["TOXICOLOGY", "0.14 mg/L"],
                            ["DNA MATCH", "VANCE, A."],
                            ["STATUS", "CRITICAL"],
                          ].map(([k, v]) => (
                            <tr key={k} className="border-b border-[#1A1817]/20">
                              <td className="py-0.5 font-black pr-1">{k}</td>
                              <td className="py-0.5 font-bold text-red-900">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Middle Left: Detailed Incident Report */}
                    <div className="bg-yellow-100/90 border-[2px] border-[#1A1817] p-3 shadow-sm rotate-[1deg]">
                      <h3 className="font-mono text-[9px] font-black border-b-[2px] border-[#1A1817] pb-1 mb-1 uppercase tracking-widest">Incident Report</h3>
                      <p className="font-mono text-[8px] font-bold text-[#1A1817] leading-tight text-justify">
                        02:14 HRS: Unit 4 dispatched to Grid E7. Multiple victims located under heavy foliage. 
                        Blood splatter analysis indicates blunt force trauma followed by lacerations. 
                        <span className="bg-neutral-900 text-transparent px-1">████ separate ████</span> weapons used.
                        Shell casings tagged at markers 4 &amp; 5. Perimeter secured at 03:00 HRS.
                        Suspects seen fleeing north towards the ravine.
                      </p>
                    </div>

                    {/* Bottom Left: Latent Print Evidence */}
                    <div className="bg-white/95 border-[2px] border-[#1A1817] p-2 shadow-md rotate-[-3deg] flex flex-col">
                      <h3 className="font-mono text-[9px] font-black border-b-[2px] border-[#1A1817] pb-1 mb-1 uppercase tracking-widest shrink-0">Latent Print #884</h3>
                      <div className="relative w-full flex-1 overflow-hidden border border-[#1A1817]/40 min-h-[4rem]">
                        {/* Using suspect1 or forensic image zoomed in and heavily filtered to look like an ink/blood smudge or macro shot */}
                        <img src="/suspect1.jpg" alt="Latent Print" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] object-cover grayscale contrast-[3.0] brightness-50" style={{ mixBlendMode: "multiply" }} />
                        <div className="absolute inset-0 bg-red-950/20 mix-blend-color-burn" />
                      </div>
                      <p className="font-mono text-[9px] mt-1 text-[#4A0000] font-black shrink-0 text-center">MATCH: 97.4% [VERIFIED]</p>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="relative mt-4 pt-4 border-t-2 border-black/20 flex items-end justify-between z-30 shrink-0">
                    <div>
                      <p className="font-handwriting text-3xl text-[#1A1817] font-bold -rotate-2">Det. R. Runewall</p>
                      <div className="font-mono text-[9px] font-black uppercase tracking-widest text-[#3A2818]">Lead Investigator — Div. 09</div>
                    </div>
                    <div className="border-[3px] border-[#4A0000] px-2 py-1 -rotate-[6deg] bg-red-950/5">
                      <p className="font-mono text-[9px] font-black tracking-widest text-[#4A0000] uppercase leading-tight text-center">AUTHORIZATION<br />GRANTED</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT PAGE (Crime Tree / Suspect Board) ── */}
              <motion.div
                animate={{ rotateY: isFlipping ? -180 : 0, translateZ: isFlipping ? 1 : 0 }}
                transition={{ duration: 1.25, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformOrigin: "left", transformStyle: "preserve-3d" }}
                className="relative w-1/2 h-full z-20"
              >
              {/* PAGE 2 FRONT */}
              <div
                className="absolute inset-0 w-full h-full bg-[#D9D0B8] rounded-r-sm overflow-hidden border border-black/10 shadow-[inset_8px_0_20px_rgba(0,0,0,0.15)]"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundImage: "radial-gradient(#1A1817 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0"
                }}
              >
                <div className="relative w-full h-full p-6 md:p-8 flex flex-col">
                  <div className="relative z-30 flex justify-between items-end border-b-[3px] border-[#1A1817] pb-2 mb-4 bg-[#D9D0B8]/90 backdrop-blur-sm shrink-0">
                    <div>
                      <h2 className="font-serif text-3xl tracking-[0.18em] font-black text-[#1A1817] uppercase">Conspiracy Board</h2>
                      <p className="font-mono text-[11px] font-black tracking-widest text-[#3A2818]">LINK MATRIX — ACTIVE</p>
                    </div>
                    <p className="font-mono text-[11px] font-black text-[#1A1817]">PAGE 2 / 3</p>
                  </div>

                  {/* SVG Red Strings Network (More intrinsic and tangled) */}
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: "drop-shadow(2px 4px 4px rgba(0,0,0,0.5))" }}>
                    {[
                      { d: "M 80 150 Q 150 200 230 250", delay: 0.1, dash: "none", w: 3 }, 
                      { d: "M 50 12 L 15 32", delay: 0.1, dash: "none", w: 3 }, // 0->1
                      { d: "M 50 12 L 50 35", delay: 0.2, dash: "none", w: 3 }, // 0->2
                      { d: "M 50 12 L 85 32", delay: 0.3, dash: "none", w: 3 }, // 0->3
                      { d: "M 15 32 L 12 60", delay: 0.4, dash: "4 4", w: 2 },  // 1->4
                      { d: "M 50 35 L 42 62", delay: 0.5, dash: "none", w: 3 }, // 2->5
                      { d: "M 50 35 L 68 62", delay: 0.6, dash: "none", w: 2 }, // 2->6
                      { d: "M 85 32 L 88 60", delay: 0.7, dash: "none", w: 3 }, // 3->7
                      { d: "M 12 60 L 30 85", delay: 0.8, dash: "2 6", w: 2 },  // 4->8
                      { d: "M 85 32 L 75 85", delay: 0.9, dash: "6 6", w: 2 },  // 3->9
                      { d: "M 68 62 L 75 85", delay: 1.0, dash: "none", w: 2 }, // 6->9
                    ].map(({ d, delay, dash, w }, i) => (
                      <motion.path key={i}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay }}
                        d={d} fill="none" stroke="#990000" strokeWidth={w / 5} strokeDasharray={dash} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    ))}
                  </svg>

                  {/* Grid/Absolute layout for non-overlapping polaroids */}
                  <div className="relative flex-1 z-20">
                    
                    {/* Node 0: Forensic Body (Root) */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                      className="absolute top-[2%] left-[50%] -translate-x-1/2 w-32 md:w-36 z-30 rotate-[-1deg]">
                      <div className="bg-white p-1.5 pb-6 shadow-2xl border-4 border-red-950 relative">
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                          <img src="/forensic-body.jpg" alt="Body" className="w-full h-full object-cover contrast-150" />
                          <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full border-2 border-yellow-400 opacity-80 rotate-12" />
                        </div>
                        <div className="absolute top-1 left-2 w-3 h-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[2px_4px_4px_rgba(0,0,0,0.5)] z-40" />
                        <div className="absolute top-1 right-2 w-3 h-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[2px_4px_4px_rgba(0,0,0,0.5)] z-40" />
                        <p className="mt-1 text-center font-mono text-[9px] font-black tracking-widest uppercase">GROUND ZERO</p>
                      </div>
                      <div className="absolute -right-16 top-6 w-28 h-16 bg-white/90 shadow-sm border border-red-200 rotate-[12deg] p-1.5 flex items-center justify-center">
                        <p className="font-handwriting text-[15px] font-bold text-red-800 leading-none">Who moved the body??</p>
                      </div>
                    </motion.div>

                    {/* Node 1: Suspect 1 */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                      className="absolute top-[25%] left-[5%] w-28 rotate-[4deg]">
                      <div className="bg-white p-1.5 pb-6 shadow-xl border border-neutral-300 relative">
                        <div className="absolute -top-2 -left-2 w-8 h-4 bg-white/40 backdrop-blur-sm rotate-[45deg] shadow-sm z-30" />
                        <div className="relative w-full aspect-[3/4] overflow-hidden">
                          <img src="/suspect1.jpg" alt="Suspect 1" className="w-full h-full object-cover grayscale contrast-125" />
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                        <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest">SUBJ A</p>
                      </div>
                      <div className="absolute -bottom-5 -right-12 w-24 h-12 bg-blue-100/90 shadow-md rotate-[-8deg] p-1 flex items-center justify-center border border-blue-300 z-10">
                        <p className="font-handwriting text-[13px] font-bold text-blue-900 leading-tight">Alibi for the 14th?</p>
                      </div>
                    </motion.div>

                    {/* Node 2: Evidence Weapon */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                      className="absolute top-[28%] left-[50%] -translate-x-1/2 w-28 rotate-[-5deg]">
                      <div className="bg-white p-1.5 pb-6 shadow-xl border border-neutral-300 relative">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <img src="/evidence-weapon.jpg" alt="Weapon" className="w-full h-full object-cover contrast-125 saturate-150" />
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-sm z-40" />
                        <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest uppercase">WEAPON #1</p>
                      </div>
                      <div className="absolute -left-14 top-4 w-20 h-12 bg-yellow-100 shadow-sm rotate-[5deg] p-1 flex items-center justify-center border border-yellow-400">
                        <p className="font-handwriting text-[12px] font-bold text-neutral-800 leading-tight">Filed off serial?!</p>
                      </div>
                    </motion.div>

                    {/* Node 3: Suspect 2 */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                      className="absolute top-[25%] right-[5%] w-28 rotate-[6deg]">
                      <div className="bg-white p-1.5 pb-6 shadow-xl border border-neutral-300 relative">
                        <div className="absolute -bottom-2 -right-2 w-8 h-4 bg-white/40 backdrop-blur-sm rotate-[45deg] shadow-sm z-30" />
                        <div className="relative w-full aspect-[3/4] overflow-hidden">
                          <img src="/suspect2.jpg" alt="Suspect 2" className="w-full h-full object-cover grayscale contrast-125" />
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                        <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest">SUBJ B</p>
                      </div>
                      <div className="absolute -bottom-6 -left-12 w-24 h-12 bg-green-100 shadow-md rotate-[-12deg] p-1 flex items-center justify-center border border-green-300 z-10">
                        <p className="font-handwriting text-[13px] font-bold text-green-900 leading-tight">Why did she lie to me?</p>
                      </div>
                    </motion.div>

                    {/* Node 4: Crime Scene Alley */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                      className="absolute top-[52%] left-[2%] w-24 rotate-[-4deg]">
                      <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-white/40 backdrop-blur-sm shadow-sm z-30" />
                        <div className="relative w-full aspect-square overflow-hidden">
                          <img src="/crimescene.jpg" alt="Alley" className="w-full h-full object-cover contrast-125" />
                        </div>
                        <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">ALLEY 4</p>
                      </div>
                      <div className="absolute -right-16 top-0 w-20 h-12 bg-yellow-200/90 shadow-sm rotate-[10deg] p-1 flex items-center justify-center border border-yellow-400">
                        <p className="font-handwriting text-[12px] font-bold text-black leading-tight">No blood trail...</p>
                      </div>
                    </motion.div>

                    {/* Node 5: Threat Note */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
                      className="absolute top-[55%] left-[32%] w-24 rotate-[8deg]">
                      <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                          <img src="/threat-note.jpg" alt="Note" className="w-full h-full object-cover contrast-125" />
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                        <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">EV 04</p>
                      </div>
                      <div className="absolute -bottom-6 left-2 w-20 h-10 bg-red-100 shadow-md rotate-[-4deg] p-1 flex items-center justify-center border border-red-300 z-10">
                        <p className="font-handwriting text-[11px] font-bold text-red-900 leading-tight">Identical handwriting!</p>
                      </div>
                    </motion.div>

                    {/* Node 6: Suspect 3 */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
                      className="absolute top-[55%] left-[58%] w-24 rotate-[-6deg]">
                      <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                        <div className="relative w-full aspect-[3/4] overflow-hidden">
                          <img src="/suspect3.jpg" alt="Suspect 3" className="w-full h-full object-cover grayscale contrast-150" />
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                        <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">SUBJ C</p>
                      </div>
                      <div className="absolute -top-4 -right-12 w-20 h-10 bg-white/80 shadow-sm rotate-[12deg] p-1 flex items-center justify-center border border-neutral-200">
                        <p className="font-handwriting text-[11px] font-bold text-neutral-800 leading-tight">He bought the ammo.</p>
                      </div>
                    </motion.div>

                    {/* Node 7: Mugshot Dark */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
                      className="absolute top-[52%] right-[2%] w-24 rotate-[3deg]">
                      <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-white/40 backdrop-blur-sm shadow-sm z-30" />
                        <div className="relative w-full aspect-[3/4] overflow-hidden">
                          <img src="/mugshot-dark.jpg" alt="Mugshot" className="w-full h-full object-cover grayscale contrast-[1.4]" />
                        </div>
                        <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">SUBJ D</p>
                      </div>
                      <div className="absolute -bottom-8 -left-8 w-24 h-12 bg-yellow-200/95 shadow-md rotate-[-10deg] p-1 flex items-center justify-center border border-yellow-400 z-10">
                        <p className="font-handwriting text-[12px] font-bold text-black leading-tight">Her secret brother?</p>
                      </div>
                    </motion.div>

                    {/* Node 8: Coroner Report */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}
                      className="absolute top-[78%] left-[20%] w-24 rotate-[-2deg]">
                      <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <img src="/coroner-report.jpg" alt="Autopsy" className="w-full h-full object-cover contrast-125" />
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                        <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">AUTOPSY</p>
                      </div>
                      <div className="absolute -right-16 top-2 w-20 h-12 bg-red-50 shadow-sm rotate-[8deg] p-1 flex items-center justify-center border border-red-200">
                        <p className="font-handwriting text-[12px] font-bold text-red-800 leading-tight">Time of death altered.</p>
                      </div>
                    </motion.div>

                    {/* Node 9: Evidence Map */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}
                      className="absolute top-[78%] right-[20%] w-24 rotate-[5deg]">
                      <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                          <img src="/evidence-map.jpg" alt="Map" className="w-full h-full object-cover contrast-125" />
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                        <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">GRID E7</p>
                      </div>
                      <div className="absolute -left-16 -top-2 w-20 h-10 bg-blue-100 shadow-sm rotate-[-6deg] p-1 flex items-center justify-center border border-blue-200">
                        <p className="font-handwriting text-[12px] font-bold text-blue-900 leading-tight">Meeting point.</p>
                      </div>
                    </motion.div>

                  </div>

                  {/* Flip button */}
                  <div className="relative mt-auto pt-4 flex justify-end z-50 shrink-0">
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                      onClick={flipToMenu}
                      className="font-handwriting text-2xl font-bold text-[#1A1817] hover:text-[#990000] transition-colors flex items-center gap-2 bg-[#D9D0B8]/90 px-3 py-1 rounded shadow-sm border border-black/20">
                      <span>[ FLIP TO MENU ]</span>
                      <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.0, repeat: Infinity }}>→</motion.span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ── PAGE 3 BACK — Basic Clear Brown Background & Handwriting Animation ── */}
              <div
                className="absolute inset-0 w-full h-full rounded-l-sm overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  backgroundColor: "#C5B293", // Basic clear brown/parchment
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a48e69' fill-opacity='0.15' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E\")", // very subtle texture
                }}
              >
                {/* ── VERITAS MORTIS — Stamp & Blood Splatter Sequence ── */}
                <AnimatePresence>
                  {showBlood && (
                    <DistressedBloodStamp text="VERITAS MORTIS" size="lg" />
                  )}
                </AnimatePresence>

                {/* ── FOUNTAIN-PEN MENU in dark red with bloody rustic hover ── */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.0 }}
                      className="absolute inset-0 flex flex-col justify-end pb-12 px-12 md:px-16 z-30"
                    >
                      <div className="space-y-6">
                        {menuItems.map((label, idx) => (
                          <motion.div
                            key={label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx, duration: 0.6 }}
                            className="relative"
                            style={{ isolation: "isolate", transform: "translateZ(0)" }}
                          >
                            <motion.button
                              onHoverStart={() => setMenuHover(idx)}
                              onHoverEnd={() => setMenuHover(null)}
                              whileHover={{ x: 10 }}
                              className="relative flex items-center gap-3 text-left group w-full"
                            >
                              <motion.span
                                animate={{ x: menuHover === idx ? [0, 5, 0] : 0 }}
                                transition={{ duration: 0.5, repeat: menuHover === idx ? Infinity : 0 }}
                                className="font-handwriting text-3xl font-black mix-blend-multiply"
                                style={{ 
                                  color: menuHover === idx ? "#7C0000" : "#5C0000",
                                  WebkitTextFillColor: menuHover === idx ? "#7C0000" : "#5C0000",
                                  WebkitTextStroke: "1px #1A0000",
                                  textShadow: "0 1px 2px rgba(20, 0, 0, 0.9)",
                                  lineHeight: 1,
                                  transform: "translateZ(0)",
                                }}
                              >›</motion.span>

                              <span
                                className="font-handwriting font-black tracking-wide relative transition-all duration-300 mix-blend-multiply"
                                style={{
                                  fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
                                  color: menuHover === idx ? "#7C0000" : "#5C0000",
                                  WebkitTextFillColor: menuHover === idx ? "#7C0000" : "#5C0000",
                                  WebkitTextStroke: "1px #1A0000",
                                  textShadow: menuHover === idx 
                                    ? "0 0 10px rgba(139,0,0,0.6), 0 1px 2px rgba(20,0,0,0.9)" 
                                    : "0 1px 2px rgba(20, 0, 0, 0.9)",
                                  fontWeight: 900,
                                  transform: "translateZ(0)",
                                }}
                              >
                                {label}
                                {/* Bloody rustic smear on hover */}
                                <motion.span
                                  className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[50%]"
                                  animate={{ opacity: menuHover === idx ? 1 : 0, scale: menuHover === idx ? 1 : 0.9 }}
                                  transition={{ duration: 0.4, ease: "easeOut" }}
                                  style={{ 
                                    background: "radial-gradient(ellipse at center, rgba(139,0,0,0.2) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                    zIndex: -1,
                                    filter: "blur(2px)",
                                  }}
                                />
                                {/* Standard underline */}
                                <motion.span
                                  className="absolute left-0 -bottom-1 h-[2px] rounded-full"
                                  animate={{ scaleX: menuHover === idx ? 1 : 0, opacity: menuHover === idx ? 1 : 0 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  style={{ width: "100%", transformOrigin: "left", backgroundColor: "#9B0000" }}
                                />
                              </span>
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Detective scribble */}
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2.2 }}
                        className="absolute bottom-6 right-8 font-handwriting text-2xl font-black rotate-6 pointer-events-none text-[#5A0000]"
                      >who is pulling the strings...?</motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Rock+Salt&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-bloody      { font-family: 'Rock Salt', cursive; }
      `}</style>
    </div>
  );
}
