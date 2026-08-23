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
import MicroCassetteDictaphone from "./MicroCassetteDictaphone";

// ── Environment Components ──
import { Typewriter } from "./environment/Typewriter";
import { DeskLamp } from "./environment/DeskLamp";
import { CigaretteTray } from "./environment/CigaretteTray";
import { DeskProps } from "./environment/DeskProps";
import { InvestigationWall } from "./environment/InvestigationWall";
import { CeilingFanShadow } from "./environment/CeilingFanShadow";
import { WindowLight } from "./environment/WindowLight";
import { WallClock } from "./environment/WallClock";
import { DustParticles } from "./environment/DustParticles";
import { DeskSurface } from "./environment/DeskSurface";
import { RoomEnvironment } from "./environment/RoomEnvironment";
import { EvidenceProps } from "./environment/EvidenceProps";

type Stage = "desk" | "spread" | "menu";

// Pre-computed static coordinates to ensure 100% deterministic SSR/client hydration
const SEAL_STARS = [
  { angle: 0, x: 50, y: 12.5 },
  { angle: 30, x: 68.75, y: 17.52 },
  { angle: 60, x: 82.48, y: 31.25 },
  { angle: 90, x: 87.5, y: 50 },
  { angle: 120, x: 82.48, y: 68.75 },
  { angle: 150, x: 68.75, y: 82.48 },
  { angle: 180, x: 50, y: 87.5 },
  { angle: 210, x: 31.25, y: 82.48 },
  { angle: 240, x: 17.52, y: 68.75 },
  { angle: 270, x: 12.5, y: 50 },
  { angle: 300, x: 17.52, y: 31.25 },
  { angle: 330, x: 31.25, y: 17.52 },
];

const RAIN_DROPS = [
  { left: "4%", height: "18px", duration: 0.85, delay: 0.2 },
  { left: "11%", height: "14px", duration: 0.95, delay: 1.1 },
  { left: "18%", height: "22px", duration: 0.75, delay: 0.6 },
  { left: "24%", height: "16px", duration: 1.1, delay: 2.3 },
  { left: "31%", height: "19px", duration: 0.8, delay: 1.7 },
  { left: "37%", height: "13px", duration: 1.0, delay: 0.4 },
  { left: "44%", height: "24px", duration: 0.7, delay: 2.1 },
  { left: "51%", height: "15px", duration: 0.9, delay: 1.4 },
  { left: "57%", height: "20px", duration: 0.82, delay: 0.9 },
  { left: "63%", height: "17px", duration: 1.05, delay: 2.7 },
  { left: "70%", height: "23px", duration: 0.78, delay: 1.9 },
  { left: "76%", height: "14px", duration: 0.92, delay: 0.5 },
  { left: "83%", height: "21px", duration: 0.88, delay: 2.4 },
  { left: "89%", height: "16px", duration: 1.02, delay: 1.3 },
  { left: "95%", height: "25px", duration: 0.72, delay: 0.8 },
  { left: "8%", height: "15px", duration: 1.15, delay: 2.9 },
  { left: "28%", height: "20px", duration: 0.84, delay: 1.6 },
  { left: "48%", height: "17px", duration: 0.96, delay: 0.3 },
  { left: "68%", height: "22px", duration: 0.76, delay: 2.2 },
  { left: "88%", height: "18px", duration: 0.91, delay: 1.8 },
];

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

// ─────────────────────────────────────────────────────────────────────────────
// Ambient Audio Engine — Environmental sounds (clock, radio, thunder)
// ─────────────────────────────────────────────────────────────────────────────
function useEnvironmentAudio() {
  const ctx = useRef<AudioContext | null>(null);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  const ac = useCallback((): AudioContext => {
    if (!ctx.current) {
      const C = window.AudioContext || (window as any).webkitAudioContext;
      ctx.current = new C();
    }
    return ctx.current;
  }, []);

  /** Subtle clock tick — soft wooden click every second */
  const startClockTick = useCallback(() => {
    const interval = setInterval(() => {
      try {
        const a = ac(); const now = a.currentTime;
        const len = a.sampleRate * 0.015;
        const buf = a.createBuffer(1, len, a.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 8);
        const src = a.createBufferSource(); src.buffer = buf;
        const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000;
        const g = a.createGain(); g.gain.value = 0.04; // Very quiet
        src.connect(hp); hp.connect(g); g.connect(a.destination);
        src.start(now); src.stop(now + 0.015);
      } catch (_) {}
    }, 1000);
    intervalsRef.current.push(interval);
  }, [ac]);

  /** Police radio static — burst every 45-90 seconds */
  const startRadioStatic = useCallback(() => {
    const voices = ["Unit 14...", "Copy...", "Negative...", "10-4...", "Suspect fleeing north..."];
    const schedule = () => {
      const delay = Math.random() * 45000 + 45000; // 45-90 seconds
      const timeout = setTimeout(() => {
        try {
          const a = ac(); const now = a.currentTime;
          const len = a.sampleRate * 0.8;
          const buf = a.createBuffer(1, len, a.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < len; i++) {
            const env = Math.pow(1 - Math.abs(i / len - 0.5) * 2, 0.3);
            d[i] = (Math.random() * 2 - 1) * env * 0.5;
          }
          const src = a.createBufferSource(); src.buffer = buf;
          const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 3;
          const g = a.createGain(); g.gain.value = 0.025; // Very quiet
          src.connect(bp); bp.connect(g); g.connect(a.destination);
          src.start(now); src.stop(now + 0.8);
        } catch (_) {}
        schedule(); // Reschedule
      }, delay);
      intervalsRef.current.push(timeout as unknown as NodeJS.Timeout);
    };
    schedule();
  }, [ac]);

  /** Distant thunder rumble — triggered externally */
  const distantThunder = useCallback(() => {
    try {
      const a = ac(); const now = a.currentTime;
      const len = a.sampleRate * 2.5;
      const buf = a.createBuffer(1, len, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const env = i < len * 0.1 ? i / (len * 0.1) : Math.pow(1 - (i - len * 0.1) / (len * 0.9), 1.5);
        d[i] = (Math.random() * 2 - 1) * env;
      }
      const src = a.createBufferSource(); src.buffer = buf;
      const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 120;
      const g = a.createGain(); g.gain.value = 0.06;
      src.connect(lp); lp.connect(g); g.connect(a.destination);
      src.start(now); src.stop(now + 2.5);
    } catch (_) {}
  }, [ac]);

  /** Stamp sound — brief thud */
  const stampThud = useCallback(() => {
    try {
      const a = ac(); const now = a.currentTime;
      const len = a.sampleRate * 0.08;
      const buf = a.createBuffer(1, len, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = a.createBufferSource(); src.buffer = buf;
      const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400;
      const g = a.createGain(); g.gain.value = 0.3;
      src.connect(lp); lp.connect(g); g.connect(a.destination);
      src.start(now); src.stop(now + 0.08);
    } catch (_) {}
  }, [ac]);

  /** Distant police siren sound — subtle 1.4s wail loop matching visual siren flash */
  const startSirenSound = useCallback(() => {
    const scheduleSiren = () => {
      try {
        const a = ac(); const now = a.currentTime;
        const osc = a.createOscillator();
        const g = a.createGain();
        const bp = a.createBiquadFilter();
        
        osc.type = "sine";
        // Pitch bend wail between 650Hz and 950Hz over 1.4s
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.7);
        osc.frequency.linearRampToValueAtTime(650, now + 1.4);

        bp.type = "bandpass";
        bp.frequency.value = 800;
        bp.Q.value = 2;

        g.gain.setValueAtTime(0.012, now); // Low distant volume
        g.gain.linearRampToValueAtTime(0.02, now + 0.7);
        g.gain.linearRampToValueAtTime(0.012, now + 1.4);

        osc.connect(bp); bp.connect(g); g.connect(a.destination);
        osc.start(now); osc.stop(now + 1.4);
      } catch (_) {}
    };
    scheduleSiren();
    const interval = setInterval(scheduleSiren, 1400);
    intervalsRef.current.push(interval as unknown as NodeJS.Timeout);
  }, [ac]);

  /** Paper rustle sound effect */
  const paperRustle = useCallback(() => {
    try {
      const a = ac(); const now = a.currentTime;
      const len = Math.floor(a.sampleRate * 0.22);
      const buf = a.createBuffer(1, len, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8) * 0.35;
      }
      const src = a.createBufferSource(); src.buffer = buf;
      const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3200; bp.Q.value = 1.2;
      const g = a.createGain(); g.gain.value = 0.08;
      src.connect(bp); bp.connect(g); g.connect(a.destination);
      src.start(now); src.stop(now + 0.22);
    } catch (_) {}
  }, [ac]);

  const stopAll = useCallback(() => {
    intervalsRef.current.forEach(id => clearTimeout(id as unknown as number));
    intervalsRef.current = [];
  }, []);

  return { startClockTick, startRadioStatic, distantThunder, stampThud, startSirenSound, paperRustle, stopAll };
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

export default function CaseFileOpeningSequence({ onBeginInvestigation }: { onBeginInvestigation?: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("desk");
  const [isFlipping, setIsFlipping] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [showGunshotFlash, setShowGunshotFlash] = useState(false);
  const [hasGunshotShake, setHasGunshotShake] = useState(false);
  const [showBlood, setShowBlood] = useState(false);
  const [showDrips, setShowDrips] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuHover, setMenuHover] = useState<number | null>(null);
  const [fileHover, setFileHover] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [activeStamp, setActiveStamp] = useState<string | null>(null);
  const stopAmbientRef = useRef<(() => void) | null>(null);

  const audio = useAudio();
  const envAudio = useEnvironmentAudio();

  // Start ambient drone on mount (after first user interaction via click on the page)
  // We start it on mount but it only activates after user gesture
  useEffect(() => {
    setIsMounted(true);
    const startOnInteract = () => {
      if (!stopAmbientRef.current) {
        const stop = audio.startAmbient();
        stopAmbientRef.current = stop;
        setAmbientOn(true);
        // Start environmental audio loops
        envAudio.startClockTick();
        envAudio.startRadioStatic();
        envAudio.startSirenSound();
      }
    };
    window.addEventListener("click", startOnInteract, { once: true });
    
    // Keyboard support for AAA game feel: Space / Enter unseals the dossier
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "Enter") && stage === "desk") {
        e.preventDefault();
        openFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("click", startOnInteract);
      window.removeEventListener("keydown", handleKeyDown);
      envAudio.stopAll();
    };
  }, [audio, envAudio, stage]);

  // Occasional stamp animation on the folder (desk stage only)
  useEffect(() => {
    if (stage !== "desk") return;
    const stamps = ["TOP SECRET", "CLASSIFIED", "CONFIDENTIAL", "EVIDENCE", "RESTRICTED", "ARCHIVED"];
    let stampTimeout: NodeJS.Timeout;

    const scheduleStamp = () => {
      const delay = Math.random() * 30000 + 30000; // 30-60 seconds
      stampTimeout = setTimeout(() => {
        if (stage !== "desk") return;
        const stamp = stamps[Math.floor(Math.random() * stamps.length)];
        setActiveStamp(stamp);
        envAudio.stampThud();
        // Clear stamp after 3 seconds
        setTimeout(() => setActiveStamp(null), 3000);
        scheduleStamp();
      }, delay);
    };
    scheduleStamp();
    return () => clearTimeout(stampTimeout);
  }, [stage, envAudio]);

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
    setStage("menu");

    // 1. VERITAS MORTIS STAMP POPS IN FIRST (just before the gunshot)
    setTimeout(() => {
      setShowStamp(true);
      envAudio.stampThud();
    }, 550);

    // 2. GUNSHOT IS HEARD POST-STAMP WITH BRIEF FLASH & CAMERA SHOCKWAVE
    setTimeout(() => {
      audio.gunshot();
      setShowGunshotFlash(true);
      setHasGunshotShake(true);
      setTimeout(() => {
        setShowGunshotFlash(false);
        setHasGunshotShake(false);
      }, 120);
    }, 1100);

    // 3. BLOOD DROPLETS & CRIME SCENE ARTERIAL SPLATTERS APPEAR POST-GUNSHOT
    setTimeout(() => {
      audio.splatter();
      setShowBlood(true);
    }, 1250);
    setTimeout(() => setShowDrips(true), 1400);
    setTimeout(() => setShowMenu(true), 2200);
  };

  const [selectedEvidence, setSelectedEvidence] = useState<{
    id: string;
    title: string;
    image: string;
    tag: string;
    timestamp: string;
    notes: string;
    forensicSummary: string;
    type: string;
  } | null>(null);

  const menuItems = [
    "BEGIN INVESTIGATION",
    "RESUME DOSSIER",
    "REPLAY SEEDS & CONFIG",
    "SYSTEM LOGS",
  ];

  const menuPreviews = [
    "CASE #900: BLACKWOOD MANOR — 02:14 HRS (INITIAL DISPATCH)",
    "CHECKPOINT: GROUND ZERO SUSPECT MATRIX (97.4% LATENT MATCH)",
    "PROCEDURAL CONFIG: SEED #884-DELTA [6 SUSPECTS, 2 WEAPONS]",
    "SYSTEM: AUDIO BUFFER STABLE · CASE LOGS PERSISTED",
  ];

  const inspectEvidence = (item: {
    id: string;
    title: string;
    image: string;
    tag: string;
    timestamp: string;
    notes: string;
    forensicSummary: string;
    type: string;
  }) => {
    envAudio.paperRustle();
    setSelectedEvidence(item);
  };

  return (
    <motion.div
      onMouseMove={onMouseMove}
      animate={hasGunshotShake ? { x: [-14, 14, -8, 8, -3, 3, 0], y: [-4, 4, -2, 2, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.14 }}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black select-none"
      style={{ perspective: "1600px" }}
    >
      {/* ── PHOTOREALISTIC DETECTIVE DESK SURFACE ENVIRONMENT ── */}
      <motion.div
        style={{ x: stage === "desk" ? bgX : 0, scale: 1.08 }}
        animate={{
          filter: stage !== "desk" ? "blur(18px) brightness(0.18) saturate(0.3)" : "blur(0px) brightness(0.85) saturate(0.85)",
          scale: stage !== "desk" ? 1.18 : 1.08,
        }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0"
      >
        {/* Blurred office background: shelves, cabinets, hanging documents */}
        <RoomEnvironment />
        {/* Physical Dark Walnut Desk Surface Layer */}
        <DeskSurface />
      </motion.div>

      {/* Deep vignette */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_55%,transparent_5%,rgba(0,0,0,0.9)_100%)]" />

      {/* ── SIREN LIGHT EFFECTS (Vivid, Legible Alternating Police Cruiser Beacons) ── */}
      {stage === "desk" && (
        <>
          {/* Blue beacon double-flash — left window & desk sweep */}
          <motion.div
            animate={{ opacity: [0, 0.85, 0.08, 0.95, 0, 0, 0, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-0 z-1"
            style={{
              background: "radial-gradient(ellipse 65% 55% at 15% 10%, rgba(30,110,255,0.85) 0%, rgba(15,60,200,0.3) 45%, transparent 75%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Red beacon double-flash — right window & wall sweep */}
          <motion.div
            animate={{ opacity: [0, 0, 0, 0, 0, 0.85, 0.08, 0.95] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-0 z-1"
            style={{
              background: "radial-gradient(ellipse 65% 55% at 85% 10%, rgba(240,25,25,0.85) 0%, rgba(180,15,15,0.3) 45%, transparent 75%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Ambient room floor reflection strobe */}
          <motion.div
            animate={{ opacity: [0, 0.25, 0.05, 0.3, 0, 0.25, 0.05, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-0 z-1"
            style={{
              background: "radial-gradient(circle at 50% 90%, rgba(100,140,255,0.15) 0%, transparent 60%)",
            }}
          />
        </>
      )}

      {/* Rain particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {isMounted && RAIN_DROPS.map((drop, i) => (
          <motion.div key={i}
            animate={{ y: ["0%", "110%"], opacity: [0, 0.25, 0] }}
            transition={{ duration: drop.duration, repeat: Infinity, delay: drop.delay, ease: "linear" }}
            className="absolute bg-blue-100/20 rounded-full"
            style={{ left: drop.left, top: "-3%", width: "1px", height: drop.height, transform: "rotate(12deg)" }}
          />
        ))}
      </div>

      {/* ── Top Game HUD Bar (Sleek Police Department Terminal) ── */}
      {stage === "desk" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 left-0 right-0 z-40 px-6 md:px-10 py-4 flex justify-between items-center pointer-events-none border-b border-white/5 bg-gradient-to-b from-black/85 via-black/40 to-transparent"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-mono text-[10px] md:text-[11.5px] font-bold tracking-[0.25em] text-[#D4C5A9]/90 uppercase">
              METROPOLITAN POLICE // DIV 09 · FORENSIC ARCHIVE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 font-mono text-[9.5px] tracking-[0.22em] text-[#A89878]">
            <span>OCTOBER 14 · 02:14 HRS</span>
            <span>•</span>
            <span className="text-[#EF4444] font-bold">INCIDENT STATUS: UNRESOLVED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] md:text-[10px] font-black tracking-widest text-[#E02020] bg-red-950/60 border border-red-900/80 px-2.5 py-0.5 rounded-xs uppercase shadow-sm">
              CLEARANCE: LEVEL V [EYES ONLY]
            </span>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
           ENVIRONMENT LAYER — Cinematic Noir Detective Office Desk (Organized & Uncluttered)
           ══════════════════════════════════════════ */}
      <AnimatePresence>
        {stage === "desk" && isMounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
          >
            {/* Dramatic Overhead Tungsten Desk Lamp Light Cone focused on Dossier */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 60% at 50% 42%, rgba(245, 195, 90, 0.12) 0%, rgba(180, 120, 35, 0.03) 50%, transparent 75%)",
              }}
            />

            {/* Leather Blotter Desk Mat (Grounds the dossier in physical space) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[48%] rounded-md pointer-events-none"
              style={{
                width: "clamp(510px, 44vw, 720px)",
                height: "clamp(630px, 56vw, 840px)",
                background: "linear-gradient(180deg, #1A120B 0%, #100B07 50%, #0A0604 100%)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.98), inset 0 0 45px rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Stitched border detailing on desk mat */}
              <div
                className="absolute inset-2.5 rounded-sm border border-dashed pointer-events-none"
                style={{ borderColor: "rgba(180, 140, 80, 0.18)" }}
              />

              {/* Desk Mat Left Side: Gold Detective Shield Clip */}
              <div className="absolute top-8 -left-5 z-20 pointer-events-auto cursor-pointer" title="Lead Detective Badge #4829">
                <svg width="42" height="54" viewBox="0 0 50 64" fill="none">
                  <path d="M25 2 L46 12 L46 36 C46 50 25 60 25 60 C25 60 4 50 4 36 L4 12 Z"
                    fill="#1A1008" stroke="#D4A227" strokeWidth="2.5" />
                  <path d="M25 6 L42 15 L42 34 C42 46 25 54 25 54 C25 54 8 46 8 34 L8 15 Z"
                    fill="#2E1C0C" stroke="#8A6820" strokeWidth="1" />
                  <polygon points="25,18 28,26 36,26 30,31 32,39 25,34 18,39 20,31 14,26 22,26"
                    fill="#F0C440" stroke="#8A6820" strokeWidth="0.5" />
                  <text x="25" y="48" textAnchor="middle" fontSize="6.5" fill="#F0C440" fontFamily="monospace" fontWeight="900">#4829</text>
                </svg>
              </div>

              {/* Desk Mat Right Side: Vintage Ceramic Coffee Mug */}
              <div className="absolute top-10 -right-6 z-20 pointer-events-auto cursor-pointer" title="Coffee Mug — 02:14 HRS">
                <svg width="44" height="44" viewBox="0 0 50 50" fill="none">
                  {/* Mug Handle */}
                  <path d="M38 18 C46 18 46 32 38 32" stroke="#8A7D70" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  {/* Mug Outer Rim */}
                  <circle cx="24" cy="25" r="18" fill="#241E1A" stroke="#574E46" strokeWidth="3" />
                  {/* Dark Coffee Fill */}
                  <circle cx="24" cy="25" r="14" fill="#0C0704" />
                  {/* Liquid surface reflection */}
                  <ellipse cx="21" cy="22" rx="8" ry="4" fill="rgba(255,255,255,0.08)" transform="rotate(-15 21 22)" />
                </svg>
              </div>
            </div>

            {/* 1980s Brushed-Steel Micro-Cassette Dictaphone on Desk */}
            <div className="hidden lg:block absolute bottom-8 left-12 z-30 pointer-events-auto transform rotate-3 scale-90">
              <MicroCassetteDictaphone />
            </div>

            {/* Atmospheric Overlays */}
            <CeilingFanShadow />
            <WindowLight />
            <DustParticles />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
           STAGE 1: THE LARGE FILE FOLDER ON DESK (Realistic Aged Brown Leather Dossier)
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {stage === "desk" && (
          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -60, rotateX: 10 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ rotateX: fileRX, rotateY: fileRY }}
            className="relative z-30 flex flex-col items-center gap-4 pt-12 md:pt-8"
          >
            {/* THE FILE (Realistic Aged Brown Leather & Manila Kraft Dossier) */}
            <motion.div
              onHoverStart={() => setFileHover(true)}
              onHoverEnd={() => setFileHover(false)}
              onClick={openFile}
              whileHover={{ scale: 1.022 }}
              className="relative cursor-pointer"
              style={{ width: "clamp(420px, 31vw, 550px)" }}
            >
              {/* ══ FOLDER BODY — Aged Leather Cover, Manila Paper Stack, Metallic Holes, Tab ══ */}
              <div
                className="relative rounded-sm overflow-visible"
                style={{
                  height: "clamp(570px, 49vw, 750px)",
                }}
              >
                {/* ── Visible Manila Paper Stack Peeking from Bottom ── */}
                {[6, 4, 2, 0].map((offset, i) => (
                  <div key={i} className="absolute bottom-[-2px] left-0 right-0 z-0" style={{
                    height: "clamp(570px, 49vw, 750px)",
                    marginLeft: `${offset}px`,
                    marginRight: `${offset}px`,
                    background: i === 0 ? "#EDE8D5" : i === 1 ? "#E2D9BE" : i === 2 ? "#D5CBAE" : "#C8BE9E",
                    borderRadius: "3px",
                    boxShadow: i === 3 ? "0 45px 100px rgba(0,0,0,0.98)" : undefined,
                  }} />
                ))}

                {/* ── Realistic Aged Brown Leather Cover ── */}
                <div
                  className="absolute inset-0 z-10 rounded-sm overflow-hidden"
                  style={{
                    background: "linear-gradient(170deg, #4E3218 0%, #3D2510 35%, #2D1A0A 70%, #1E0F04 100%)",
                    boxShadow: "inset 0 0 65px rgba(0,0,0,0.7), 0 35px 90px rgba(0,0,0,0.98)",
                    border: "1px solid rgba(160,110,50,0.3)",
                  }}
                >
                  {/* Leather grain SVG texture overlay */}
                  <svg className="absolute inset-0 w-full h-full opacity-25 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                    <filter id="leather-noise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
                      <feColorMatrix type="saturate" values="0" />
                      <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#leather-noise)" opacity="0.9" />
                  </svg>

                  {/* Worn edge highlights */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-[#8A6030]/40" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-[#0A0604]/90" />
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-[#8A6030]/25" />

                  {/* Coffee ring stains */}
                  <div className="absolute top-7 right-10 w-28 h-28 rounded-full border-[5px] border-[#1A0E06]/45 pointer-events-none mix-blend-multiply" />
                  <div className="absolute top-14 right-16 w-14 h-14 rounded-full border-[3px] border-[#1A0E06]/35 pointer-events-none mix-blend-multiply" />
                  <div className="absolute top-56 left-10 w-16 h-16 rounded-full border-[3px] border-[#1A0E06]/28 pointer-events-none mix-blend-multiply" />

                  {/* Horizontal crease line */}
                  <div className="absolute left-4 right-0 top-[52%] h-[1px] bg-[#0E0804]/70 pointer-events-none" />
                </div>

                {/* ── Kraft Tab Label ── */}
                <div className="absolute -top-[22px] left-[18px] z-20">
                  <div className="px-4 py-1.5 rounded-t-sm"
                    style={{
                      background: "linear-gradient(180deg, #8A6830 0%, #6A4E20 100%)",
                      boxShadow: "0 -2px 6px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,220,120,0.25)",
                      border: "1px solid #4A3010",
                    }}>
                    <p className="font-mono text-[9px] font-black tracking-[0.25em] text-[#F0E4C0] uppercase">CASE 900-B</p>
                  </div>
                </div>

                {/* ── Metallic Brass Binder Rings ── */}
                <div className="absolute left-[10px] top-[22%] z-30">
                  <div className="w-5 h-5 rounded-full"
                    style={{ background: "radial-gradient(circle at 35% 35%, #8A6820, #1A1208)", border: "2px solid #C9A227", boxShadow: "0 2px 4px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,220,80,0.2)" }} />
                </div>
                <div className="absolute left-[10px] top-[68%] z-30">
                  <div className="w-5 h-5 rounded-full"
                    style={{ background: "radial-gradient(circle at 35% 35%, #8A6820, #1A1208)", border: "2px solid #C9A227", boxShadow: "0 2px 4px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,220,80,0.2)" }} />
                </div>

                {/* ── Metallic Paperclip SVG ── */}
                <div className="absolute -top-6 left-20 z-30">
                  <svg width="26" height="90" viewBox="0 0 26 90" fill="none">
                    <path d="M13 5 Q5 5 5 14 L5 78 Q5 86 13 86 Q21 86 21 78 L21 22 Q21 15 13 15 Q5 15 5 22 L5 78"
                      stroke="#8A7D70" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M13 5 Q21 5 21 14 L21 78" stroke="#D4C5A9" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
                  </svg>
                </div>

                {/* ── Spine Shadow ── */}
                <div className="absolute left-0 top-0 bottom-0 w-7 bg-gradient-to-r from-[#080402]/95 to-transparent pointer-events-none z-20" />

                {/* ── CONTENT (On Top of Leather Cover) ── */}
                <div className="absolute inset-0 z-20 ml-7 flex flex-col px-7 pt-6 pb-6">

                  {/* File Number Box — Top Right */}
                  <div className="absolute top-5 right-5 z-30" style={{ border: "2.5px solid #1A0E06", background: "rgba(20,10,4,0.75)", padding: "7px 12px" }}>
                    <p className="font-mono text-[10.5px] font-black tracking-[0.18em] text-[#E8DCC0] uppercase">FILE NO. 900-B</p>
                    <p className="font-mono text-[7.5px] font-black text-[#A89878] tracking-widest mt-0.5">UNRESOLVED EVIDENCE</p>
                  </div>

                  {/* ── Agency Seal / Logo (Crisp, High Legibility Gold Foil SVG) ── */}
                  <div className="flex flex-col items-center mt-2 mb-2">
                    <div className="relative rounded-full p-2.5"
                      style={{ background: "#0D0804", boxShadow: "0 8px 26px rgba(0,0,0,0.95), 0 0 0 1px rgba(201,162,39,0.3)" }}>
                      <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="47" stroke="#8A6820" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
                        <circle cx="50" cy="50" r="44" stroke="#F0C440" strokeWidth="2.2" />
                        <circle cx="50" cy="50" r="41" stroke="#A88020" strokeWidth="0.8" />
                        <circle cx="50" cy="50" r="40" fill="#120A05" />
                        {SEAL_STARS.map(({ angle, x, y }) => (
                          <ellipse
                            key={angle}
                            cx={x}
                            cy={y}
                            rx="1.4"
                            ry="2.5"
                            transform={`rotate(${angle} ${x} ${y})`}
                            fill="#F0C440"
                            opacity="0.85"
                          />
                        ))}
                        <circle cx="50" cy="50" r="34" stroke="#F0C440" strokeWidth="1.2" />
                        <circle cx="50" cy="50" r="32" fill="#180C05" />
                        <path d="M50 18 L68 27 L68 50 Q68 64 50 70 Q32 64 32 50 L32 27Z"
                          stroke="#F0C440" strokeWidth="1.8" fill="#241006" fillOpacity="0.9" />
                        <line x1="50" y1="28" x2="50" y2="60" stroke="#F0C440" strokeWidth="1.8" />
                        <line x1="35" y1="38" x2="65" y2="38" stroke="#F0C440" strokeWidth="1.8" />
                        <path d="M34 38 L30 50 Q34 54 39 50Z" stroke="#F0C440" strokeWidth="1.2" fill="#F0C440" fillOpacity="0.5" />
                        <path d="M66 38 L62 50 Q66 54 70 50Z" stroke="#F0C440" strokeWidth="1.2" fill="#F0C440" fillOpacity="0.5" />
                        <polygon points="50,8 52,14 58,14 53,18 55,24 50,20 45,24 47,18 42,14 48,14"
                          fill="#F0C440" stroke="#8A6820" strokeWidth="0.5" />
                        <path id="top-arc" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" />
                        <path id="bot-arc" d="M 16 66 A 40 40 0 0 0 84 66" fill="none" />
                        <text fontSize="4.8" fill="#F0C440" fontWeight="900" fontFamily="monospace" letterSpacing="0.4">
                          <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
                            BUREAU OF CRIMINAL INVESTIGATION
                          </textPath>
                        </text>
                        <text fontSize="4.2" fill="#D4A227" fontWeight="800" fontFamily="monospace" letterSpacing="0.4">
                          <textPath href="#bot-arc" startOffset="50%" textAnchor="middle">
                            DEPT. OF FORENSIC PATHOLOGY · DIV 09
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* ── Title Banner on Front Dossier ── */}
                  <div className="border-[2px] border-[#2A1608] bg-[#140B05]/85 p-3.5 rounded-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C9A227]/70" />
                    <p className="font-mono text-[9px] font-black tracking-[0.32em] text-[#C9A227] uppercase mb-0.5">
                      CLASSIFIED EVIDENCE DOSSIER
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl font-black tracking-widest text-[#F0E6D2] uppercase">
                      VERITAS MORTIS
                    </h2>
                    <p className="font-mono text-[8px] font-bold tracking-[0.22em] text-[#B8A484] mt-0.5">
                      HOMICIDE DIVISION · CASE 900-B · GROUND ZERO MATRIX
                    </p>
                  </div>

                  {/* ── Full Typewritten Case Metadata Table (Detailed & Legible) ── */}
                  <div className="mt-3 border border-[#2A1608] bg-[#180D06]/75 p-3 rounded-sm font-mono text-[8.5px] leading-relaxed text-[#E0D4BC]">
                    <div className="grid grid-cols-2 gap-2 border-b border-[#3A220E] pb-2 mb-2">
                      <div>
                        <span className="text-[#8A7454] font-black uppercase">CASE CLASSIFICATION:</span>
                        <p className="font-bold text-[#F5EDE0]">HOMICIDE — LEVEL V</p>
                      </div>
                      <div>
                        <span className="text-[#8A7454] font-black uppercase">PRIMARY VICTIM:</span>
                        <p className="font-bold text-[#F5EDE0]">VANCE, ARTHUR (M / 42)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-[#3A220E] pb-2 mb-2">
                      <div>
                        <span className="text-[#8A7454] font-black uppercase">TIME OF INCIDENT:</span>
                        <p className="font-bold text-[#F5EDE0]">02:14 HRS · OCT 14</p>
                      </div>
                      <div>
                        <span className="text-[#8A7454] font-black uppercase">SCENE LOCATION:</span>
                        <p className="font-bold text-[#F5EDE0]">GRID E7 (BLACKWOOD RAVINE)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[#8A7454] font-black uppercase">LEAD INVESTIGATOR:</span>
                        <p className="font-bold text-[#F5EDE0]">DET. R. RUNEWALL (DIV 09)</p>
                      </div>
                      <div>
                        <span className="text-[#8A7454] font-black uppercase">CHAIN OF CUSTODY:</span>
                        <p className="font-bold text-[#C9A227]">EVIDENCE VAULT 4 · AUDITED</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Red Diagonal Stamp & Bottom Security Badge ── */}
                  <div className="mt-auto flex justify-between items-end pt-2">
                    <div className="border border-[#3A220E] px-2 py-1 bg-black/60">
                      <p className="font-mono text-[7.5px] text-[#A89878] font-bold">CLEARANCE: EYES ONLY</p>
                    </div>
                    <div className="border-2 border-[#8B0000] px-3 py-1 -rotate-6 bg-red-950/35">
                      <p className="font-mono text-xs font-black tracking-widest text-[#E02020] uppercase">
                        RESTRICTED ACCESS
                      </p>
                    </div>
                  </div>

                  {/* Occasional stamp on desk */}
                  <AnimatePresence>
                    {activeStamp && (
                      <motion.div
                        initial={{ scale: 2, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: -8 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                      >
                        <div className="border-4 border-[#8B0000] px-6 py-3 rounded bg-red-950/40 backdrop-blur-xs">
                          <p className="font-mono text-2xl font-black tracking-widest text-[#E02020] uppercase">{activeStamp}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Interactive Game Action Prompt Button */}
            <motion.button
              onClick={openFile}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 group flex items-center gap-3 px-6 py-2.5 rounded-xs bg-[#1A120B]/90 hover:bg-[#2A1D12] border border-[#D4A227]/40 hover:border-[#D4A227] shadow-[0_10px_30px_rgba(0,0,0,0.9)] transition-all cursor-pointer pointer-events-auto"
            >
              <div className="w-2 h-2 rounded-full bg-[#D4A227] shadow-[0_0_8px_#D4A227] animate-pulse" />
              <span className="font-mono text-xs md:text-sm font-black tracking-[0.28em] text-[#F0E4C0] uppercase group-hover:text-white transition-colors">
                ▶ UNSEAL CASE DOSSIER [PRESS SPACE]
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
           STAGES 2 & 3: OPEN DOSSIER (Realistic Aged Kraft / Parchment Spread)
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
              {/* ── LEFT PAGE (Evidence Log — Aged Forensic Parchment) ── */}
              <div className="relative w-1/2 h-full bg-[#EDE8D5] rounded-l-sm overflow-hidden border border-black/15 shadow-[inset_-10px_0_24px_rgba(0,0,0,0.25)] z-10">
                <div className="relative w-full h-full p-6 md:p-8 flex flex-col">
                  <div className="relative z-30 flex justify-between items-end border-b-[3px] border-[#1A1817] pb-2 mb-4 bg-[#EDE8D5]/90 backdrop-blur-sm shrink-0">
                    <div>
                      <h2 className="font-serif text-3xl tracking-[0.18em] font-black text-[#1A1817] uppercase">Evidence Log</h2>
                      <p className="font-mono text-[11px] font-black tracking-widest text-[#3A2818]">DEPT.09 · CASE #77-B · FORENSIC DIVISION</p>
                    </div>
                    <p className="font-mono text-[11px] font-black text-[#1A1817]">PAGE 1 / 3</p>
                  </div>

                  {/* Grid Layout for Forensic Evidence Cards */}
                  <div className="relative flex-1 grid grid-cols-2 gap-4 z-20">
                    
                    {/* Top Left: Threat Note */}
                    <div
                      onClick={() => inspectEvidence({
                        id: "ev-11",
                        title: "Handwritten Threat Note",
                        image: "/threat-note.jpg",
                        tag: "EV-11 · RECOVERED IN PARKING LOT",
                        timestamp: "10/14 01:55 HRS",
                        notes: "Handwriting matches suspect's prior journal. Note left on victim's windshield warning of consequences.",
                        forensicSummary: "Graphology match: 94.2%. Ink composition: Standard black ballpoint (Bic).",
                        type: "DOCUMENT",
                      })}
                      className="bg-white/95 border border-red-950 p-2 shadow-md rotate-[-2deg] cursor-pointer hover:scale-105 transition-transform group"
                      title="Click to inspect Evidence #11"
                    >
                      <div className="w-full aspect-[4/3] overflow-hidden mb-1 relative border border-black/20">
                        <img src="/threat-note.jpg" alt="Threat Note" className="w-full h-full object-cover contrast-125" />
                        <div className="absolute inset-0 bg-red-950/0 group-hover:bg-red-950/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 font-mono text-[7px] text-white bg-black/85 px-1 py-0.5 rounded font-black tracking-widest">[INSPECT]</span>
                        </div>
                      </div>
                      <p className="font-mono text-[8px] text-center text-red-950 font-black uppercase">EVIDENCE #11 🔍</p>
                    </div>

                    {/* Top Right: Coroner Blood Toxicology & Autopsy Table */}
                    <div
                      onClick={() => inspectEvidence({
                        id: "ev-coroner",
                        title: "Coroner Blood Toxicology Report",
                        image: "/coroner-report.jpg",
                        tag: "AUTOPSY-900 · DEPT OF FORENSICS",
                        timestamp: "10/14 04:30 HRS",
                        notes: "Coroner confirmed blunt force trauma to temporal lobe prior to lacerations. Foreign blood type present on jacket sleeve.",
                        forensicSummary: "Blood: O-POS · Hemoglobin: 7.4 g/dL · Toxicology: 0.14 mg/L unknown synthetic agent.",
                        type: "REPORT",
                      })}
                      className="row-span-2 bg-white/95 border-[2px] border-[#1A1817] p-3 shadow-lg rotate-[1deg] flex flex-col cursor-pointer hover:scale-102 transition-transform group"
                      title="Click to inspect Coroner Report"
                    >
                      <div className="w-full aspect-square overflow-hidden mb-2 border border-black/20 relative">
                        <img src="/coroner-report.jpg" alt="Coroner Report" className="w-full h-full object-cover contrast-125 saturate-50" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 font-mono text-[7px] text-white bg-black/85 px-1 py-0.5 rounded font-black tracking-widest">[INSPECT]</span>
                        </div>
                      </div>
                      <h3 className="font-mono text-[10px] font-black border-b-[2px] border-[#1A1817] pb-1 mb-1 tracking-widest uppercase text-[#1A1817]">
                        Blood Serum #4920-B 🔍
                      </h3>
                      <table className="w-full font-mono text-[8px] text-[#1A1817]">
                        <tbody>
                          {[
                            ["BLOOD TYPE", "O-POS (MISMATCH)"],
                            ["HEMOGLOBIN", "7.4 g/dL"],
                            ["TOXICOLOGY", "0.14 mg/L (SEDATIVE)"],
                            ["DNA MATCH", "ALBRIGHT, M. (97.4%)"],
                            ["STATUS", "LETHAL HEMORRHAGE"],
                          ].map(([k, v]) => (
                            <tr key={k} className="border-b border-[#1A1817]/20">
                              <td className="py-0.5 font-black pr-1 text-[#3A2818]">{k}</td>
                              <td className="py-0.5 font-black text-red-900">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Middle Left: Dense Incident Dispatch Field Log */}
                    <div className="bg-[#FFF9E6] border-[2px] border-[#1A1817] p-3 shadow-sm rotate-[1deg]">
                      <h3 className="font-mono text-[9px] font-black border-b-[2px] border-[#1A1817] pb-1 mb-1 uppercase tracking-widest text-[#1A1817]">Incident Field Dispatch</h3>
                      <p className="font-mono text-[8px] font-bold text-[#1A1817] leading-tight text-justify">
                        02:14 HRS: Unit 4 dispatched to Grid E7. Victim located under pine canopy. 
                        Blood splatter trajectory indicates blunt force trauma followed by lacerations at 45° angle. 
                        <span className="bg-black text-white px-1 font-mono">████ separate ████</span> weapons used.
                        Shell casings tagged at markers 4 &amp; 5. Perimeter secured at 03:00 HRS.
                      </p>
                    </div>

                    {/* Bottom Left: Latent Print Evidence Card */}
                    <div
                      onClick={() => inspectEvidence({
                        id: "ev-latent",
                        title: "Latent Fingerprint Print #884",
                        image: "/suspect1.jpg",
                        tag: "LATENT PRINT · RECOVERED ON WEAPON",
                        timestamp: "10/14 02:45 HRS",
                        notes: "Partial thumbprint lifted from brass revolver barrel. AFIS cross-reference confirms 97.4% match with Subj A.",
                        forensicSummary: "Ridge characteristics: 14 minutiae points confirmed. No smudging on delta whorl.",
                        type: "PRINT",
                      })}
                      className="bg-white/95 border-[2px] border-[#1A1817] p-2 shadow-md rotate-[-3deg] flex flex-col cursor-pointer hover:scale-105 transition-transform group"
                      title="Click to inspect Latent Print #884"
                    >
                      <h3 className="font-mono text-[9px] font-black border-b-[2px] border-[#1A1817] pb-1 mb-1 uppercase tracking-widest shrink-0 text-[#1A1817]">Latent Print #884 🔍</h3>
                      <div className="relative w-full flex-1 overflow-hidden border border-[#1A1817]/40 min-h-[4rem] bg-neutral-900">
                        <img src="/suspect1.jpg" alt="Latent Print" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] object-cover grayscale contrast-[3.0] brightness-90" />
                        <div className="absolute inset-0 bg-red-950/20 group-hover:bg-red-950/40 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 font-mono text-[7px] text-white bg-black/85 px-1 py-0.5 rounded font-black tracking-widest">[INSPECT]</span>
                        </div>
                      </div>
                      <p className="font-mono text-[9px] mt-1 text-[#4A0000] font-black shrink-0 text-center">MATCH: 97.4% [AFIS CONFIRMED]</p>
                    </div>
                  </div>

                  {/* Signature Box */}
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

              {/* ── RIGHT PAGE (Conspiracy Board / Link Matrix) ── */}
              <motion.div
                animate={{ rotateY: isFlipping ? -180 : 0, translateZ: isFlipping ? 1 : 0 }}
                transition={{ duration: 1.25, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformOrigin: "left", transformStyle: "preserve-3d" }}
                className="relative w-1/2 h-full z-20"
              >
                {/* FRONT: Conspiracy Board on Aged Cork/Parchment */}
                <div
                  className="absolute inset-0 w-full h-full bg-[#D9D0B8] rounded-r-sm overflow-hidden border border-black/15 shadow-[inset_10px_0_24px_rgba(0,0,0,0.25)] z-10"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="relative w-full h-full p-6 md:p-8 flex flex-col">
                    <div className="relative z-30 flex justify-between items-end border-b-[3px] border-[#1A1817] pb-2 mb-4 bg-[#D9D0B8]/90 backdrop-blur-sm shrink-0">
                      <div>
                        <h2 className="font-serif text-3xl tracking-[0.18em] font-black text-[#1A1817] uppercase">Conspiracy Board</h2>
                        <p className="font-mono text-[11px] font-black tracking-widest text-[#8B0000]">LINK MATRIX — ACTIVE</p>
                      </div>
                      <p className="font-mono text-[11px] font-black text-[#1A1817]">PAGE 2 / 3</p>
                    </div>

                    {/* SVG Red Strings Network */}
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: "drop-shadow(2px 4px 4px rgba(0,0,0,0.5))" }}>
                      {[
                        { d: "M 80 150 Q 150 200 230 250", delay: 0.1, dash: "none", w: 3 }, 
                        { d: "M 50 12 L 15 32", delay: 0.1, dash: "none", w: 3 },
                        { d: "M 50 12 L 50 35", delay: 0.2, dash: "none", w: 3 },
                        { d: "M 50 12 L 85 32", delay: 0.3, dash: "none", w: 3 },
                        { d: "M 15 32 L 12 60", delay: 0.4, dash: "4 4", w: 2 },
                        { d: "M 50 35 L 42 62", delay: 0.5, dash: "none", w: 3 },
                        { d: "M 50 35 L 68 62", delay: 0.6, dash: "none", w: 2 },
                        { d: "M 85 32 L 88 60", delay: 0.7, dash: "none", w: 3 },
                        { d: "M 12 60 L 30 85", delay: 0.8, dash: "2 6", w: 2 },
                        { d: "M 85 32 L 75 85", delay: 0.9, dash: "6 6", w: 2 },
                        { d: "M 68 62 L 75 85", delay: 1.0, dash: "none", w: 2 },
                      ].map(({ d, delay, dash, w }, i) => (
                        <motion.path key={i}
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay }}
                          d={d} fill="none" stroke="#990000" strokeWidth={w / 5} strokeDasharray={dash} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                      ))}
                    </svg>

                    {/* Nodes Matrix */}
                    <div className="relative flex-1 z-20">
                      
                      {/* Node 0: Forensic Body */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        onClick={() => inspectEvidence({
                          id: "ev-body",
                          title: "Ground Zero — Crime Scene Primary Node",
                          image: "/forensic-body.jpg",
                          tag: "PRIMARY SCENE · GRID E7",
                          timestamp: "10/14 02:14 HRS",
                          notes: "Body found in supine position with defensive trauma on wrists. Clear drag marks originating 15ft north.",
                          forensicSummary: "Lividity consistent with time of death 02:00-02:30 HRS. Two foreign fibers recovered from lapel.",
                          type: "PHOTO",
                        })}
                        className="absolute top-[2%] left-[50%] -translate-x-1/2 w-32 md:w-36 z-30 rotate-[-1deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Ground Zero"
                      >
                        <div className="bg-white p-1.5 pb-6 shadow-2xl border-4 border-red-950 relative">
                          <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                            <img src="/forensic-body.jpg" alt="Body" className="w-full h-full object-cover contrast-150" />
                          </div>
                          <div className="absolute top-1 left-2 w-3 h-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[2px_4px_4px_rgba(0,0,0,0.5)] z-40" />
                          <div className="absolute top-1 right-2 w-3 h-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[2px_4px_4px_rgba(0,0,0,0.5)] z-40" />
                          <p className="mt-1 text-center font-mono text-[9px] font-black tracking-widest uppercase">GROUND ZERO 🔍</p>
                        </div>
                        <div className="absolute -right-16 top-6 w-28 h-16 bg-white/90 shadow-sm border border-red-200 rotate-[12deg] p-1.5 flex items-center justify-center pointer-events-none">
                          <p className="font-handwriting text-[15px] font-bold text-red-800 leading-none">Who moved the body??</p>
                        </div>
                      </motion.div>

                      {/* Node 1: Suspect 1 */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                        onClick={() => inspectEvidence({
                          id: "subj-a",
                          title: "Subject A — Marcus Albright",
                          image: "/suspect1.jpg",
                          tag: "SUSPECT #1 · PERSON OF INTEREST",
                          timestamp: "LAST SEEN: 10/13 23:45 HRS",
                          notes: "Reported missing 2 hours before incident. Cell tower ping registers 0.4 miles from scene at 02:10 HRS.",
                          forensicSummary: "Motive: Financial dispute / inheritance blackmail. Latent print on weapon matched.",
                          type: "PHOTO",
                        })}
                        className="absolute top-[25%] left-[5%] w-28 rotate-[4deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Subject A"
                      >
                        <div className="bg-white p-1.5 pb-6 shadow-xl border border-neutral-300 relative">
                          <div className="relative w-full aspect-[3/4] overflow-hidden">
                            <img src="/suspect1.jpg" alt="Suspect 1" className="w-full h-full object-cover grayscale contrast-125" />
                          </div>
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                          <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest">SUBJ A 🔍</p>
                        </div>
                        <div className="absolute -bottom-5 -right-12 w-24 h-12 bg-blue-100/90 shadow-md rotate-[-8deg] p-1 flex items-center justify-center border border-blue-300 z-10 pointer-events-none">
                          <p className="font-handwriting text-[13px] font-bold text-blue-900 leading-tight">Alibi for the 14th?</p>
                        </div>
                      </motion.div>

                      {/* Node 2: Evidence Weapon */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                        onClick={() => inspectEvidence({
                          id: "ev-weapon",
                          title: "Murder Weapon #1 — Caliber .38 Revolver",
                          image: "/evidence-weapon.jpg",
                          tag: "BALLISTICS · RECOVERED IN CREEK",
                          timestamp: "10/14 06:15 HRS",
                          notes: "Serial number filed off with coarse abrasive. 2 spent casings in cylinder, 4 unspent hollow points.",
                          forensicSummary: "Striation marks match lead fragments extracted from crime scene timber.",
                          type: "PHOTO",
                        })}
                        className="absolute top-[28%] left-[50%] -translate-x-1/2 w-28 rotate-[-5deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Weapon #1"
                      >
                        <div className="bg-white p-1.5 pb-6 shadow-xl border border-neutral-300 relative">
                          <div className="relative w-full aspect-square overflow-hidden">
                            <img src="/evidence-weapon.jpg" alt="Weapon" className="w-full h-full object-cover contrast-125 saturate-150" />
                          </div>
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-sm z-40" />
                          <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest uppercase">WEAPON #1 🔍</p>
                        </div>
                        <div className="absolute -left-14 top-4 w-20 h-12 bg-yellow-100 shadow-sm rotate-[5deg] p-1 flex items-center justify-center border border-yellow-400 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-neutral-800 leading-tight">Filed off serial?!</p>
                        </div>
                      </motion.div>

                      {/* Node 3: Suspect 2 */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                        onClick={() => inspectEvidence({
                          id: "subj-b",
                          title: "Subject B — Elena Vance",
                          image: "/suspect2.jpg",
                          tag: "SUSPECT #2 · CO-CONSPIRATOR",
                          timestamp: "INTERROGATED: 10/14 08:00 HRS",
                          notes: "Wife of primary victim. Claimed to be sleeping at residence during time of incident.",
                          forensicSummary: "Toll booth records contradict statement. Vehicle spotted at North Turnpike 02:40 HRS.",
                          type: "PHOTO",
                        })}
                        className="absolute top-[25%] right-[5%] w-28 rotate-[6deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Subject B"
                      >
                        <div className="bg-white p-1.5 pb-6 shadow-xl border border-neutral-300 relative">
                          <div className="relative w-full aspect-[3/4] overflow-hidden">
                            <img src="/suspect2.jpg" alt="Suspect 2" className="w-full h-full object-cover grayscale contrast-125" />
                          </div>
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                          <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest">SUBJ B 🔍</p>
                        </div>
                        <div className="absolute -bottom-6 -left-12 w-24 h-12 bg-green-100 shadow-md rotate-[-12deg] p-1 flex items-center justify-center border border-green-300 z-10 pointer-events-none">
                          <p className="font-handwriting text-[13px] font-bold text-green-900 leading-tight">Why did she lie?</p>
                        </div>
                      </motion.div>

                      {/* Node 4: Crime Scene Alley */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                        onClick={() => inspectEvidence({
                          id: "ev-alley",
                          title: "Crime Scene — Alleyway Grid E7",
                          image: "/crimescene.jpg",
                          tag: "LOCATION · PERIMETER SECURED",
                          timestamp: "10/14 02:14 HRS",
                          notes: "Rain began at 02:30 HRS, partially washing tire treads. Footprints lead towards drainage culvert.",
                          forensicSummary: "Shoe impression: Size 10.5 combat tread (Vibram sole pattern).",
                          type: "PHOTO",
                        })}
                        className="absolute top-[52%] left-[2%] w-24 rotate-[-4deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Alley 4"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-square overflow-hidden">
                            <img src="/crimescene.jpg" alt="Alley" className="w-full h-full object-cover contrast-125" />
                          </div>
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">ALLEY 4 🔍</p>
                        </div>
                        <div className="absolute -right-16 top-0 w-20 h-12 bg-yellow-200/90 shadow-sm rotate-[10deg] p-1 flex items-center justify-center border border-yellow-400 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-black leading-tight">No blood trail...</p>
                        </div>
                      </motion.div>

                      {/* Node 5: Threat Note */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
                        onClick={() => inspectEvidence({
                          id: "ev-threat-note-2",
                          title: "Threat Note #2",
                          image: "/threat-note.jpg",
                          tag: "DOCUMENT · CLASSIFIED",
                          timestamp: "10/14 01:55 HRS",
                          notes: "Second handwritten note recovered from glovebox.",
                          forensicSummary: "Identical pressure grooves and ink formula.",
                          type: "DOCUMENT",
                        })}
                        className="absolute top-[55%] left-[32%] w-24 rotate-[8deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Threat Note"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-[4/3] overflow-hidden">
                            <img src="/threat-note.jpg" alt="Note" className="w-full h-full object-cover contrast-125" />
                          </div>
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">EV 04 🔍</p>
                        </div>
                        <div className="absolute -bottom-6 left-2 w-20 h-10 bg-red-100 shadow-md rotate-[-4deg] p-1 flex items-center justify-center border border-red-300 z-10 pointer-events-none">
                          <p className="font-handwriting text-[11px] font-bold text-red-900 leading-tight">Identical handwriting!</p>
                        </div>
                      </motion.div>

                      {/* Node 6: Suspect 3 */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
                        onClick={() => inspectEvidence({
                          id: "subj-c",
                          title: "Subject C — Frank 'The Fixer' Corvo",
                          image: "/suspect3.jpg",
                          tag: "SUSPECT #3 · ARMS TRAFFICKER",
                          timestamp: "TAGGED: 10/14 11:20 HRS",
                          notes: "Purchased box of .38 special ammunition from Westside Pawn on 10/12.",
                          forensicSummary: "Surveillance footage confirms meeting with Subject A 4 hours before homicide.",
                          type: "PHOTO",
                        })}
                        className="absolute top-[55%] left-[58%] w-24 rotate-[-6deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Subject C"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-[3/4] overflow-hidden">
                            <img src="/suspect3.jpg" alt="Suspect 3" className="w-full h-full object-cover grayscale contrast-150" />
                          </div>
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff4444,#990000)] shadow-[1px_2px_2px_rgba(0,0,0,0.5)] z-40" />
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">SUBJ C 🔍</p>
                        </div>
                        <div className="absolute -top-4 -right-12 w-20 h-10 bg-white/80 shadow-sm rotate-[12deg] p-1 flex items-center justify-center border border-neutral-200 pointer-events-none">
                          <p className="font-handwriting text-[11px] font-bold text-neutral-800 leading-tight">He bought the ammo.</p>
                        </div>
                      </motion.div>

                      {/* Node 7: Mugshot Dark */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
                        onClick={() => inspectEvidence({
                          id: "subj-d",
                          title: "Subject D — Unknown Accomplice",
                          image: "/mugshot-dark.jpg",
                          tag: "SUSPECT #4 · UNIDENTIFIED",
                          timestamp: "ARCHIVE RECORD #441",
                          notes: "Shadowy figure spotted on security camera entering rear service alley at 02:08 HRS.",
                          forensicSummary: "Height: approx 6'1\", heavy build, wearing dark trench coat.",
                          type: "PHOTO",
                        })}
                        className="absolute top-[52%] right-[2%] w-24 rotate-[3deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Subject D"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-[3/4] overflow-hidden">
                            <img src="/mugshot-dark.jpg" alt="Mugshot" className="w-full h-full object-cover grayscale contrast-[1.4]" />
                          </div>
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">SUBJ D 🔍</p>
                        </div>
                        <div className="absolute -bottom-8 -left-8 w-24 h-12 bg-yellow-200/95 shadow-md rotate-[-10deg] p-1 flex items-center justify-center border border-yellow-400 z-10 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-black leading-tight">Her secret brother?</p>
                        </div>
                      </motion.div>

                      {/* Node 8: Coroner Report */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}
                        onClick={() => inspectEvidence({
                          id: "ev-autopsy",
                          title: "Coroner Autopsy Report #4920",
                          image: "/coroner-report.jpg",
                          tag: "MEDICAL EXAMINER · CONFIDENTIAL",
                          timestamp: "10/14 05:00 HRS",
                          notes: "Time of death estimated between 02:00 and 02:30. Body showed initial signs of hypothermia before trauma.",
                          forensicSummary: "Toxicology confirms trace alkaloid compounds. Possible chemical sedation.",
                          type: "REPORT",
                        })}
                        className="absolute top-[78%] left-[20%] w-24 rotate-[-2deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Autopsy"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-square overflow-hidden">
                            <img src="/coroner-report.jpg" alt="Autopsy" className="w-full h-full object-cover contrast-125" />
                          </div>
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">AUTOPSY 🔍</p>
                        </div>
                        <div className="absolute -right-16 top-2 w-20 h-12 bg-red-50 shadow-sm rotate-[8deg] p-1 flex items-center justify-center border border-red-200 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-red-800 leading-tight">Time of death altered.</p>
                        </div>
                      </motion.div>

                      {/* Node 9: Evidence Map */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}
                        onClick={() => inspectEvidence({
                          id: "ev-map",
                          title: "Topographical Crime Scene Map — Grid E7",
                          image: "/evidence-map.jpg",
                          tag: "CARTOGRAPHY · SECTOR 09",
                          timestamp: "10/14 02:14 HRS",
                          notes: "Meeting point marked at crossroads near ravine bridge. Footpath connects directly to western service road.",
                          forensicSummary: "Escape route verified. Soil composition matches tire treads found at Marker 4.",
                          type: "DOCUMENT",
                        })}
                        className="absolute top-[78%] right-[20%] w-24 rotate-[5deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Map"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-[4/3] overflow-hidden">
                            <img src="/evidence-map.jpg" alt="Map" className="w-full h-full object-cover contrast-125" />
                          </div>
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">GRID E7 🔍</p>
                        </div>
                        <div className="absolute -left-16 -top-2 w-20 h-10 bg-blue-100 shadow-sm rotate-[-6deg] p-1 flex items-center justify-center border border-blue-200 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-blue-900 leading-tight">Meeting point.</p>
                        </div>
                      </motion.div>
                      {/* Node 7: Mugshot Dark */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
                        onClick={() => inspectEvidence({
                          id: "subj-d",
                          title: "Subject D — Unknown Accomplice",
                          image: "/mugshot-dark.jpg",
                          tag: "SUSPECT #4 · UNIDENTIFIED",
                          timestamp: "ARCHIVE RECORD #441",
                          notes: "Shadowy figure spotted on security camera entering rear service alley at 02:08 HRS.",
                          forensicSummary: "Height: approx 6'1\", heavy build, wearing dark trench coat.",
                          type: "PHOTO",
                        })}
                        className="absolute top-[52%] right-[2%] w-24 rotate-[3deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Subject D"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-[3/4] overflow-hidden">
                            <img src="/mugshot-dark.jpg" alt="Mugshot" className="w-full h-full object-cover grayscale contrast-[1.4]" />
                          </div>
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">SUBJ D 🔍</p>
                        </div>
                        <div className="absolute -bottom-8 -left-8 w-24 h-12 bg-yellow-200/95 shadow-md rotate-[-10deg] p-1 flex items-center justify-center border border-yellow-400 z-10 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-black leading-tight">Her secret brother?</p>
                        </div>
                      </motion.div>

                      {/* Node 8: Coroner Report */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}
                        onClick={() => inspectEvidence({
                          id: "ev-autopsy",
                          title: "Coroner Autopsy Report #4920",
                          image: "/coroner-report.jpg",
                          tag: "MEDICAL EXAMINER · CONFIDENTIAL",
                          timestamp: "10/14 05:00 HRS",
                          notes: "Time of death estimated between 02:00 and 02:30. Body showed initial signs of hypothermia before trauma.",
                          forensicSummary: "Toxicology confirms trace alkaloid compounds. Possible chemical sedation.",
                          type: "REPORT",
                        })}
                        className="absolute top-[78%] left-[20%] w-24 rotate-[-2deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Autopsy"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-square overflow-hidden">
                            <img src="/coroner-report.jpg" alt="Autopsy" className="w-full h-full object-cover contrast-125" />
                          </div>
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">AUTOPSY 🔍</p>
                        </div>
                        <div className="absolute -right-16 top-2 w-20 h-12 bg-red-50 shadow-sm rotate-[8deg] p-1 flex items-center justify-center border border-red-200 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-red-800 leading-tight">Time of death altered.</p>
                        </div>
                      </motion.div>

                      {/* Node 9: Evidence Map */}
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}
                        onClick={() => inspectEvidence({
                          id: "ev-map",
                          title: "Topographical Crime Scene Map — Grid E7",
                          image: "/evidence-map.jpg",
                          tag: "CARTOGRAPHY · SECTOR 09",
                          timestamp: "10/14 02:14 HRS",
                          notes: "Meeting point marked at crossroads near ravine bridge. Footpath connects directly to western service road.",
                          forensicSummary: "Escape route verified. Soil composition matches tire treads found at Marker 4.",
                          type: "DOCUMENT",
                        })}
                        className="absolute top-[78%] right-[20%] w-24 rotate-[5deg] cursor-pointer hover:scale-105 transition-transform"
                        title="Click to inspect Map"
                      >
                        <div className="bg-white p-1 pb-5 shadow-lg border border-neutral-300 relative">
                          <div className="relative w-full aspect-[4/3] overflow-hidden">
                            <img src="/evidence-map.jpg" alt="Map" className="w-full h-full object-cover contrast-125" />
                          </div>
                          <p className="mt-1 text-center font-mono text-[7px] font-black tracking-widest">GRID E7 🔍</p>
                        </div>
                        <div className="absolute -left-16 -top-2 w-20 h-10 bg-blue-100 shadow-sm rotate-[-6deg] p-1 flex items-center justify-center border border-blue-200 pointer-events-none">
                          <p className="font-handwriting text-[12px] font-bold text-blue-900 leading-tight">Meeting point.</p>
                        </div>
                      </motion.div>

                    </div>

                    {/* Flip button */}
                    <div className="relative mt-auto pt-4 flex justify-end z-50 shrink-0">
                      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                        onClick={flipToMenu}
                        className="font-handwriting text-2xl font-bold text-[#1A1817] hover:text-[#990000] transition-colors flex items-center gap-2 bg-[#D9D0B8]/90 px-3.5 py-1 rounded shadow-md border border-black/20">
                        <span>[ FLIP TO MENU ]</span>
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.0, repeat: Infinity }}>→</motion.span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* ── PAGE 3 BACK — Fullscreen Clean Canvas with High-Contrast Dark Menu ── */}
                <div
                  className="absolute inset-0 w-full h-full rounded-l-sm overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    transformStyle: "flat",
                    isolation: "isolate",
                    backgroundImage: "url('/image_54b06d_clean.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "#120d09",
                  }}
                >
                  {/* Gunshot Muzzle Flash on Page */}
                  <AnimatePresence>
                    {showGunshotFlash && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.08 }}
                        className="absolute inset-0 bg-red-950/40 backdrop-brightness-150 pointer-events-none z-40"
                        style={{
                          boxShadow: "inset 0 0 120px rgba(180,0,0,0.85)",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* ── INTERACTIVE DOSSIER NAVIGATION (Bottom-Left Quadrant) ── */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.nav
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex flex-col justify-end items-start pb-12 md:pb-16 pl-10 md:pl-14 z-30 pointer-events-none"
                        aria-label="Forensic Case Menu"
                      >
                        {/* Menu Hover Preview Callout */}
                        <div className="h-6 mb-2 pointer-events-none">
                          <AnimatePresence mode="wait">
                            {menuHover !== null && (
                              <motion.div
                                key={menuHover}
                                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                transition={{ duration: 0.18 }}
                                className="font-mono text-[9.5px] md:text-[11px] font-black tracking-widest text-[#7A0C0C] bg-[#CBB89B]/95 py-0.5 px-2.5 rounded border border-[#7A0C0C]/40 inline-block shadow-sm"
                              >
                                ▶ {menuPreviews[menuHover]}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <ul className="space-y-2 md:space-y-3 pointer-events-auto list-none max-w-xl">
                          {menuItems.map((label, idx) => (
                            <motion.li
                              key={label}
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 24,
                                delay: 0.08 * idx,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (idx === 0 && onBeginInvestigation) {
                                    envAudio.stampThud();
                                    onBeginInvestigation();
                                  }
                                }}
                                onMouseEnter={() => {
                                  setMenuHover(idx);
                                  envAudio.paperRustle();
                                }}
                                onMouseLeave={() => setMenuHover(null)}
                                className="relative block text-left py-0.5 group cursor-pointer bg-transparent border-0 p-0 m-0 select-none outline-none"
                                style={{
                                  fontFamily: "'Caveat', 'Rock Salt', 'Permanent Marker', cursive",
                                  fontSize: "clamp(1.85rem, 3.4vw, 2.75rem)",
                                  fontWeight: 900,
                                  letterSpacing: "0.02em",
                                  lineHeight: 1.15,
                                  color: menuHover === idx ? "#A00000" : "#5C0000",
                                  transform: menuHover === idx ? "translateX(14px) scale(1.03)" : "translateX(0px)",
                                  textShadow: menuHover === idx
                                    ? "0 0 16px rgba(180, 0, 0, 0.55), 0 1px 3px rgba(10, 0, 0, 0.5)"
                                    : "0 1px 2px rgba(40, 0, 0, 0.35)",
                                  transition: "transform 0.22s cubic-bezier(0.2, 1, 0.3, 1), color 0.2s ease, text-shadow 0.2s ease",
                                }}
                              >
                                <span className="relative inline-block">
                                  {`> ${label}`}

                                  {/* Dynamic Organic Blood Droplets & Gravity Drip Trails from Letters on Hover */}
                                  <AnimatePresence>
                                    {menuHover === idx && (
                                      <div className="absolute inset-0 pointer-events-none overflow-visible">
                                        {[
                                          { left: "10%", delay: 0.0, duration: 1.2, size: 10, maxDrop: 52 },
                                          { left: "28%", delay: 0.35, duration: 1.45, size: 12.5, maxDrop: 78 },
                                          { left: "48%", delay: 0.15, duration: 1.15, size: 9, maxDrop: 45 },
                                          { left: "68%", delay: 0.65, duration: 1.5, size: 13, maxDrop: 84 },
                                          { left: "88%", delay: 0.45, duration: 1.3, size: 10.5, maxDrop: 60 },
                                        ].map((drop, dIdx) => (
                                          <div key={dIdx} className="absolute" style={{ left: drop.left, bottom: "-4px" }}>
                                            {/* Elongating Viscous Blood Trail Neck */}
                                            <motion.div
                                              initial={{ scaleY: 0, opacity: 0 }}
                                              animate={{
                                                scaleY: [0, 1, 0.8, 0],
                                                opacity: [0, 0.95, 0.7, 0],
                                              }}
                                              transition={{
                                                duration: drop.duration,
                                                repeat: Infinity,
                                                delay: drop.delay,
                                                ease: "easeIn",
                                              }}
                                              style={{
                                                transformOrigin: "top",
                                                height: `${drop.maxDrop * 0.75}px`,
                                                width: `${Math.max(1.8, drop.size * 0.22)}px`,
                                                background: "linear-gradient(to bottom, #7A0404 0%, #A00000 65%, #C20A0A 100%)",
                                                borderRadius: "1px",
                                                boxShadow: "0 0 4px rgba(120, 0, 0, 0.7)",
                                              }}
                                            />

                                            {/* Falling Bulbous Teardrop Bead with Specular Glint */}
                                            <motion.div
                                              initial={{ opacity: 0, y: 0, scale: 0.4 }}
                                              animate={{
                                                opacity: [0, 1, 1, 0.9, 0],
                                                y: [0, drop.maxDrop * 0.35, drop.maxDrop * 0.75, drop.maxDrop],
                                                scaleY: [0.7, 1.35, 1.5, 1.0],
                                                scaleX: [1.2, 0.85, 0.8, 1.2],
                                              }}
                                              transition={{
                                                duration: drop.duration,
                                                repeat: Infinity,
                                                delay: drop.delay,
                                                ease: [0.4, 0, 0.75, 1],
                                              }}
                                              style={{ position: "absolute", top: 0, left: -drop.size / 2 + 1 }}
                                            >
                                              <svg
                                                width={drop.size}
                                                height={drop.size * 1.6}
                                                viewBox="0 0 10 16"
                                                className="drop-shadow-[0_3px_6px_rgba(40,0,0,0.9)]"
                                              >
                                                <path
                                                  d="M 5 0 C 5 0, 0.5 7.5, 0.5 11.5 C 0.5 14.5, 2.5 16, 5 16 C 7.5 16, 9.5 14.5, 9.5 11.5 C 9.5 7.5, 5 0, 5 0 Z"
                                                  fill="#9E0C0C"
                                                />
                                                <ellipse cx="3.8" cy="11.5" rx="1.4" ry="2.2" fill="rgba(255,255,255,0.85)" />
                                              </svg>
                                            </motion.div>

                                            {/* Micro Blood Splash/Puddle at landing point */}
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0 }}
                                              animate={{
                                                opacity: [0, 0, 0.9, 0],
                                                scale: [0, 0, 1.4, 2.0],
                                              }}
                                              transition={{
                                                duration: drop.duration,
                                                repeat: Infinity,
                                                delay: drop.delay,
                                                ease: "easeOut",
                                              }}
                                              style={{
                                                position: "absolute",
                                                top: drop.maxDrop,
                                                left: -drop.size / 3,
                                                width: `${drop.size * 0.8}px`,
                                                height: `${drop.size * 0.4}px`,
                                                borderRadius: "50%",
                                                background: "radial-gradient(circle, #8A0000 0%, #500000 80%, transparent 100%)",
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </AnimatePresence>

                                  {/* Interactive Expanding Wet Crimson Underline */}
                                  <motion.span
                                    className="absolute left-0 -bottom-1 h-0.5 bg-[#8A0000] rounded-full pointer-events-none"
                                    animate={{
                                      width: menuHover === idx ? "100%" : "0%",
                                      opacity: menuHover === idx ? 0.95 : 0,
                                    }}
                                    transition={{ duration: 0.24, ease: "easeOut" }}
                                  />
                                </span>
                              </button>
                            </motion.li>
                          ))}
                        </ul>

                        {/* Detective scribble in bottom-right */}
                        <motion.p
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.85, scale: 1 }}
                          transition={{ delay: 0.65, duration: 0.4 }}
                          className="absolute bottom-5 right-8 font-handwriting text-xl md:text-2xl font-black rotate-6 pointer-events-none text-[#5C0000]"
                          style={{
                            fontFamily: "'Caveat', cursive",
                            textShadow: "0 1px 1px rgba(40, 0, 0, 0.3)",
                          }}
                        >
                          who is pulling the strings...?
                        </motion.p>
                      </motion.nav>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
           FORENSIC EVIDENCE INSPECTION LIGHTBOX MODAL (Vintage Parchment)
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedEvidence(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, rotate: -1 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-xl w-full bg-[#EDE8D5] text-[#1A1817] p-6 md:p-8 rounded-sm shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-4 border-[#2A1808]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start border-b-2 border-[#1A1817] pb-3 mb-4">
                <div>
                  <span className="font-mono text-[9px] font-black tracking-widest text-[#7A0C0C] bg-red-100 px-2 py-0.5 border border-red-300 uppercase">
                    {selectedEvidence.tag}
                  </span>
                  <h3 className="font-serif text-2xl font-black mt-1 uppercase tracking-wide text-[#1A1817]">
                    {selectedEvidence.title}
                  </h3>
                  <p className="font-mono text-[10px] text-neutral-600 font-bold">
                    TIMESTAMP: {selectedEvidence.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="font-mono text-xs font-black bg-[#2A1808] text-[#EDE8D5] px-2.5 py-1 rounded hover:bg-red-900 transition-colors"
                >
                  ✕ CLOSE [ESC]
                </button>
              </div>

              {/* Card Body with Large Image & Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border-2 border-black/30 p-2 bg-white shadow-inner flex flex-col items-center">
                  <div className="w-full aspect-[4/3] overflow-hidden bg-black relative">
                    <img
                      src={selectedEvidence.image}
                      alt={selectedEvidence.title}
                      className="w-full h-full object-cover contrast-125"
                    />
                    <div className="absolute top-2 right-2 font-mono text-[8px] bg-red-950/80 text-white px-1.5 py-0.5 font-bold">
                      HIGH RES
                    </div>
                  </div>
                  <p className="font-mono text-[8px] text-neutral-500 mt-2 font-bold text-center">
                    EVIDENCE SECURED · CRIME LAB 09
                  </p>
                </div>

                <div className="flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-mono text-[10px] font-black uppercase text-[#7A0C0C] border-b border-[#1A1817]/20 pb-1 mb-1.5">
                      Investigator Case Notes
                    </h4>
                    <p className="font-handwriting text-lg font-bold text-neutral-900 leading-snug">
                      "{selectedEvidence.notes}"
                    </p>
                  </div>

                  <div className="bg-[#D9D0B8] p-2.5 border border-black/20 rounded-sm">
                    <h4 className="font-mono text-[9px] font-black uppercase tracking-widest text-[#1A1817] mb-1">
                      Forensic Lab Findings
                    </h4>
                    <p className="font-mono text-[9px] font-bold text-neutral-800 leading-relaxed">
                      {selectedEvidence.forensicSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-[#1A1817]/20 flex justify-between items-center text-[9px] font-mono text-neutral-600 font-bold">
                <span>VERITAS MORTIS FORENSIC ARCHIVE</span>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="font-handwriting text-base font-bold text-[#7A0C0C] hover:underline"
                >
                  Return to Case Dossier →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Permanent+Marker&family=Rock+Salt&family=Special+Elite&display=swap');
        .font-typewriter  { font-family: 'Special Elite', 'Courier Prime', monospace; }
        .font-handwriting { font-family: 'Caveat', 'Rock Salt', 'Permanent Marker', cursive; }
        .font-marker      { font-family: 'Permanent Marker', 'Rock Salt', cursive; }
        .font-bloody      { font-family: 'Rock Salt', cursive; }
      `}</style>
    </motion.div>
  );
}
