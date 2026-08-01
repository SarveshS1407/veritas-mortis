"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";

export default function CaseDossierModal({ opened }: { opened: boolean }) {
  // bookState: 0 = Closed (Cover), 1 = Spread (Evidence), 2 = Menu Reveal
  const [bookState, setBookState] = useState(0);
  const [showBlood, setShowBlood] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Audio References
  const pageTurnAudio = useRef<Howl | null>(null);
  const gunshotAudio = useRef<Howl | null>(null);
  const splatterAudio = useRef<Howl | null>(null);

  useEffect(() => {
    // Initialize audio (expects files in public/ folder)
    pageTurnAudio.current = new Howl({ src: ['/page-turn.mp3'], volume: 0.8 });
    gunshotAudio.current = new Howl({ src: ['/gunshot.mp3'], volume: 0.7 });
    splatterAudio.current = new Howl({ src: ['/splatter.mp3'], volume: 0.9 });
  }, []);

  const handleOpenCover = () => {
    if (pageTurnAudio.current) pageTurnAudio.current.play();
    setBookState(1);
  };

  const handleRevealMenu = () => {
    if (pageTurnAudio.current) pageTurnAudio.current.play();
    setBookState(2);
  };

  // Cinematic Sequence Logic
  useEffect(() => {
    if (bookState === 2) {
      // 1. As the page lands (approx 800ms after flip starts)
      const t1 = setTimeout(() => {
        if (gunshotAudio.current) gunshotAudio.current.play();
      }, 800);

      // 2. The splatter hits immediately after the gunshot
      const t2 = setTimeout(() => {
        if (splatterAudio.current) splatterAudio.current.play();
        setShowBlood(true);
      }, 950);

      // 3. The menu gracefully fades in
      const t3 = setTimeout(() => {
        setShowMenu(true);
      }, 2500);

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [bookState]);

  const menuOptions = [
    "BEGIN INVESTIGATION",
    "RESUME DOSSIER",
    "REPLAY SEEDS & CONFIG",
    "SYSTEM LOGS"
  ];

  return (
    <AnimatePresence>
      {opened && (
        <motion.div
          initial={{ opacity: 0, y: "100%", rotateX: 10 }}
          animate={{ opacity: 1, y: "2%", rotateX: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 mx-auto w-full max-w-[1200px] h-[90vh] z-40 origin-bottom flex items-center justify-center p-4"
          style={{ perspective: "3000px" }}
        >
          {/* THE PHYSICAL BOOK STACK */}
          <div className="relative w-full h-full shadow-[0_40px_80px_rgba(0,0,0,0.9)] flex">
            
            {/* The Left Side (Holds the flipped pages) */}
            <div className="w-1/2 h-full relative" />

            {/* The Right Side (Holds the unflipped pages and the stack) */}
            <div className="w-1/2 h-full relative">

             {/* ── LAYER 3: MENU PAGE (Bottom-most, always right side) ── */}
              <div className="absolute inset-0 w-full h-full bg-[#EFECE4] rounded-r-sm border border-black/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.3] mix-blend-multiply pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />

                {/* Atmospheric backdrop — faint forensic photo bleeding through the page, heavily desaturated and vignetted so the parchment still reads */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img src="/forensic-body.jpg" alt="" className="w-full h-full object-cover opacity-[0.12] grayscale contrast-150" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#EFECE4]/40 via-[#EFECE4]/80 to-[#EFECE4]/95" />
                  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 10px 4px rgba(0,0,0,0.25), inset 0 0 140px 50px rgba(0,0,0,0.35)" }} />
                </div>

                {/* Corner blood-texture bleed for extra grime */}
                <img src="/blood-splatter-2.jpg" alt="" className="absolute -bottom-6 -left-6 w-48 opacity-25 mix-blend-multiply pointer-events-none z-0" />

                {/* Rubber-stamped case marker */}
                <div className="absolute top-8 right-8 z-10 rotate-[9deg] border-[3px] border-[#7a0000]/80 rounded-sm px-3 py-1.5 mix-blend-multiply opacity-80 pointer-events-none">
                  <p className="font-mono text-[10px] tracking-[0.35em] text-[#7a0000] font-bold">CASE NO. 4471</p>
                  <p className="font-mono text-sm tracking-[0.25em] text-[#7a0000] font-black text-center">UNSOLVED</p>
                </div>

                {/* Pinned mugshot, red string running toward the title */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" style={{ filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.4))" }}>
                  <path d="M 118 190 L 300 330" fill="none" stroke="#7a0000" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                <div className="absolute top-10 left-10 z-10 w-32 md:w-36 bg-white p-1.5 pb-6 shadow-xl -rotate-[8deg] pointer-events-none">
                  <img src="/mugshot-dark.jpg" alt="Subject mugshot" className="w-full aspect-[3/4] object-cover grayscale contrast-[1.4]" />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-700 shadow-md border border-red-900" />
                  <p className="mt-1 text-center font-handwriting text-black/80 text-xs leading-none -rotate-1">DRAVEN, V. — SUBJECT</p>
                </div>

                {/* Pinned threat note, bottom margin */}
                <div className="absolute bottom-10 right-10 z-10 w-28 md:w-32 rotate-[7deg] shadow-xl pointer-events-none">
                  <img src="/threat-note.jpg" alt="Threat note" className="w-full object-cover contrast-125" />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-700 shadow-md border border-red-900" />
                </div>

                <div className="relative w-full h-full p-16 flex flex-col justify-center z-10">
                  
                  {/* The Bloody Title Splatter */}
                  <AnimatePresence>
                    {showBlood && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.1, type: "spring", stiffness: 300, damping: 10 }}
                        className="relative z-20 mb-10"
                      >
                        <h1
                          className="font-bloody text-7xl md:text-8xl text-[#3a0000] -rotate-3 leading-tight"
                          style={{ textShadow: "1px 1px 0 #150000, -1px 1px 0 #150000, 0 3px 8px rgba(0,0,0,0.55)" }}
                        >
                          Veritas<br/>Mortis
                        </h1>
                        
                        {/* Massive SVG Blood Splatters */}
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="absolute -top-12 -left-12 w-64 h-64 bg-red-900 mix-blend-multiply opacity-90 blur-[1px] pointer-events-none origin-center" 
                          style={{ clipPath: "polygon(34% 5%, 52% 0, 71% 7%, 86% 23%, 100% 41%, 95% 61%, 86% 83%, 68% 97%, 46% 100%, 25% 91%, 9% 75%, 0 54%, 5% 31%, 19% 14%)" }} 
                        />
                        <motion.div 
                          initial={{ scale: 0, y: -100 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="absolute top-24 left-32 w-4 h-32 bg-red-800 mix-blend-multiply pointer-events-none rounded-b-full" // Dripping blood
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* The Elegant Contrasting Menu */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="space-y-6 ml-8 max-w-[65%] relative z-30"
                      >
                        {menuOptions.map((label, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ x: 15, letterSpacing: "0.2em" }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative block text-left group overflow-hidden"
                          >
                            <span className="font-serif font-bold text-lg md:text-2xl tracking-widest text-[#1a1a1a] transition-colors duration-300 relative z-10 group-hover:text-[#5a0000]">
                              {label}
                            </span>
                            {/* Elegant strike animation on hover */}
                            <span className="absolute left-0 top-1/2 w-full h-[1px] bg-[#5a0000] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-20" />
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Redacted forensic detail strip — fills the lower margin so the page no longer reads empty */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.8, delay: 0.4 }}
                        className="mt-12 ml-8 max-w-xs relative z-10 pointer-events-none"
                      >
                        <p className="font-mono text-[10px] text-black/50 tracking-wider leading-relaxed">
                          LOCATION: <span className="bg-black/70 text-black/70 select-none">REDACTED DISTRICT</span><br/>
                          TIME OF DEATH: 02:47 AM<br/>
                          STATUS: <span className="text-[#7a0000] font-bold">ACTIVE — DO NOT DISTRIBUTE</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* ── LAYER 2: EVIDENCE PAGE (Middle) ── */}
              <motion.div
                initial={false}
                animate={{ rotateY: bookState >= 2 ? -180 : 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left", transformStyle: "preserve-3d" }}
                className="absolute inset-0 w-full h-full z-20"
              >
                {/* Evidence Page FRONT (Visible in State 1 on Right) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#EFECE4] rounded-r-sm border border-black/10 overflow-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
                  
                  <div className="relative w-full h-full p-8">
                    {/* SVG Red Strings */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: "drop-shadow(2px 4px 2px rgba(0,0,0,0.4))" }}>
                      <path d="M -100 250 L 200 150" fill="none" stroke="#8B0000" strokeWidth="2" strokeDasharray="4 2" />
                      <path d="M 200 150 L 350 400" fill="none" stroke="#8B0000" strokeWidth="2" strokeDasharray="4 2" />
                    </svg>

                    {/* Suspect Polaroid */}
                    <div className="absolute top-16 left-16 w-48 bg-white p-2 pb-8 shadow-xl rotate-6 z-20">
                      <img src="/suspect1.jpg" alt="Suspect" className="w-full aspect-[3/4] object-cover grayscale contrast-125" />
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 shadow-md border border-red-900" />
                      <p className="mt-2 text-center font-handwriting text-black/90 font-bold -rotate-1 text-sm">VANCE, A.</p>
                    </div>

                    {/* CSS Fingerprint Card */}
                    <div className="absolute bottom-24 right-16 w-56 bg-white p-4 shadow-lg -rotate-3 z-20 border border-gray-300">
                      <h3 className="font-mono text-xs font-bold border-b border-black pb-1 mb-2">LATENT PRINT CARD - #884</h3>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="border border-black h-20 flex items-center justify-center opacity-70">
                          {/* Faux Fingerprint SVG */}
                          <svg viewBox="0 0 100 100" className="w-12 h-12 opacity-60" fill="none" stroke="black" strokeWidth="1.5">
                            <path d="M30 50 Q 50 10 70 50 M40 50 Q 50 20 60 50 M35 60 Q 50 30 65 60 M25 70 Q 50 20 75 70" />
                          </svg>
                        </div>
                        <div className="border border-black h-20 flex items-center justify-center opacity-70">
                          <svg viewBox="0 0 100 100" className="w-12 h-12 opacity-60" fill="none" stroke="black" strokeWidth="1.5">
                            <path d="M30 50 Q 50 10 70 50 M40 50 Q 50 20 60 50 M35 60 Q 50 30 65 60 M25 70 Q 50 20 75 70" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Turn to Menu Button */}
                    <button 
                      onClick={handleRevealMenu}
                      className="absolute bottom-8 right-8 font-handwriting text-3xl font-bold text-[#8B0000] hover:text-[#D30000] transition-colors z-50 mix-blend-multiply flex items-center gap-2"
                    >
                      Turn To Menu &rarr;
                    </button>
                  </div>
                </div>

                {/* Evidence Page BACK (Visible in State 2 on Left) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#EFECE4] rounded-l-sm border-r border-black/10 overflow-hidden shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1)]"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
                  {/* Heavy Blood Smear on the back of the page */}
                  <div className="absolute bottom-0 right-0 w-full h-full bg-red-900 mix-blend-multiply opacity-40 blur-[4px]" style={{ clipPath: "polygon(100% 60%, 40% 100%, 100% 100%)" }} />
                </div>
              </motion.div>

              {/* ── LAYER 1: THE BROWN COVER (Top-most) ── */}
              <motion.div
                initial={false}
                animate={{ rotateY: bookState >= 1 ? -180 : 0 }}
                transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformOrigin: "left", transformStyle: "preserve-3d" }}
                className="absolute inset-0 w-full h-full z-30"
              >
                {/* COVER FRONT */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#C2A378] rounded-r-sm border border-[#8C704B] overflow-hidden shadow-[inset_0_0_60px_rgba(92,64,51,0.6)]"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* Cardboard Texture */}
                  <div className="absolute inset-0 opacity-[0.7] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
                  
                  {/* Paperclip */}
                  <div className="absolute top-[-10px] left-24 w-8 h-24 border-4 border-gray-400 rounded-full shadow-lg rotate-6 bg-transparent z-10 mix-blend-overlay" />

                  <div className="relative w-full h-full flex flex-col p-16">
                    {/* SVG Detective Logo Stamp */}
                    <div className="absolute top-16 right-16 opacity-70 mix-blend-multiply">
                      <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="#2A1E15" strokeWidth="2">
                        <circle cx="50" cy="50" r="45" strokeDasharray="4 2" />
                        <path d="M 50 15 L 75 40 L 75 75 L 50 90 L 25 75 L 25 40 Z" />
                        <text x="50" y="55" fontSize="10" textAnchor="middle" fill="#2A1E15" stroke="none" className="font-serif font-bold">NIGHTFALL</text>
                        <text x="50" y="65" fontSize="6" textAnchor="middle" fill="#2A1E15" stroke="none" className="font-serif">BUREAU OF INVESTIGATION</text>
                      </svg>
                    </div>

                    <h1 className="font-mono text-3xl tracking-widest text-[#2A1E15] mt-12 font-bold uppercase">
                      Classified Dossier
                    </h1>
                    <p className="font-mono text-lg text-[#4A3525] mt-4">NBI DIVISION - HOM. SEC. 4</p>

                    <div className="mt-auto space-y-6">
                      <div className="w-3/4 border-b-2 border-[#4A3525] pb-1 flex justify-between">
                        <span className="font-mono text-xs uppercase text-[#4A3525]">Lead Investigator:</span>
                        <span className="font-handwriting text-xl text-[#2A1E15]">Det. Runewall</span>
                      </div>
                      <div className="w-3/4 border-b-2 border-[#4A3525] pb-1 flex justify-between">
                        <span className="font-mono text-xs uppercase text-[#4A3525]">Subject Name:</span>
                        <span className="font-handwriting text-xl text-[#2A1E15]">Victor Draven</span>
                      </div>
                      <div className="w-3/4 border-b-2 border-[#4A3525] pb-1 flex justify-between">
                        <span className="font-mono text-xs uppercase text-[#4A3525]">Case Status:</span>
                        <span className="font-mono text-sm font-bold text-red-800">OPEN</span>
                      </div>
                    </div>

                    {/* Open Button */}
                    <button onClick={handleOpenCover} className="absolute inset-0 w-full h-full cursor-pointer z-50 focus:outline-none" />
                    <p className="absolute bottom-16 right-16 font-handwriting text-2xl text-[#8B0000] animate-pulse">Open File &rarr;</p>
                  </div>
                </div>

                {/* COVER BACK (Visible in State 1 on Left) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#E0CAAA] rounded-l-sm border-r border-[#8C704B] shadow-[inset_20px_0_40px_rgba(92,64,51,0.2)] overflow-hidden"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
                  
                  <div className="relative w-full h-full p-8">
                    {/* Bloody Crime Scene Photo */}
                    <div className="absolute top-16 right-16 w-56 bg-white p-2 pb-8 shadow-xl -rotate-6 z-20">
                      <div className="relative w-full aspect-[4/3]">
                        <img src="/crimescene.jpg" alt="Crime Scene" className="w-full h-full object-cover contrast-150 saturate-50" />
                        {/* Heavy Blood Overlay on Photo */}
                        <div className="absolute inset-0 bg-red-800 mix-blend-multiply opacity-70" style={{ clipPath: "polygon(0 0, 100% 20%, 80% 100%, 0 100%)" }} />
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 shadow-md border border-red-900" />
                    </div>

                    {/* Suspect 2 */}
                    <div className="absolute bottom-24 left-16 w-40 bg-white p-2 pb-8 shadow-xl rotate-12 z-20">
                      <img src="/suspect2.jpg" alt="Suspect Side" className="w-full aspect-[3/4] object-cover grayscale contrast-125" />
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 shadow-md border border-red-900" />
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      )}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Rock+Salt&family=Playfair+Display:ital,wght@0,400;1,700&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-bloody { font-family: 'Rock Salt', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </AnimatePresence>
  );
}
