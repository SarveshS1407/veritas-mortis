"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractiveDossierMenu({ opened }: { opened: boolean }) {
  const [pageFlipped, setPageFlipped] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Red string paths for the murder board
  const string1 = "M 250 150 Q 300 200 450 120"; // Suspect 1 to Crime Scene
  const string2 = "M 450 120 Q 550 300 700 250"; // Crime Scene to Suspect 2
  const string3 = "M 250 150 Q 400 450 650 400"; // Suspect 1 to Blood Report

  return (
    <AnimatePresence>
      {opened && (
        <motion.div
          initial={{ opacity: 0, y: "100%", rotateX: 20 }}
          animate={{ opacity: 1, y: "5%", rotateX: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute inset-0 mx-auto w-full max-w-[1200px] h-[90vh] z-40 origin-bottom flex items-center justify-center"
          style={{ perspective: "2000px" }}
        >
          {/* THE MASTER CASE FILE (Book/Folder Structure) */}
          <div className="relative w-full h-full max-w-[1000px] max-h-[700px] flex shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
            
            {/* ── LEFT SIDE (Back Cover/Inside Menu) ── */}
            <div className="relative w-1/2 h-full bg-[#E3D3B5] rounded-l-md border-r-2 border-[#C2B294] overflow-hidden">
              {/* Paper Texture */}
              <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
              
              {/* The Menu (Only visible when flipped) */}
              <div className="absolute inset-0 p-12 flex flex-col items-start justify-center pl-24">
                <h1 className="font-handwriting text-7xl font-bold text-[#1A1A1A] mb-12 -rotate-2 mix-blend-multiply opacity-90">
                  Veritas Mortis
                </h1>
                
                <div className="space-y-6">
                  {["Begin Investigation", "Examine Evidence", "System Settings"].map((label, idx) => (
                    <motion.button
                      key={idx}
                      onHoverStart={() => setHoveredNode(label)}
                      onHoverEnd={() => setHoveredNode(null)}
                      whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
                      className="relative block font-handwriting text-5xl font-bold text-[#2A2A2A] mix-blend-multiply transition-colors"
                    >
                      {/* Red circle drawn on hover */}
                      <AnimatePresence>
                        {hoveredNode === label && (
                          <motion.svg
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute -inset-4 w-[120%] h-[150%] pointer-events-none"
                            viewBox="0 0 100 40"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M 10 20 Q 50 5 90 20 Q 100 35 50 35 Q 0 35 10 20"
                              fill="none"
                              stroke="#A82020"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDE (Front Cover/Murder Board) ── */}
            {/* This div represents the page that flips over */}
            <motion.div
              initial={false}
              animate={{ rotateY: pageFlipped ? -180 : 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "left", transformStyle: "preserve-3d" }}
              className="absolute right-0 w-1/2 h-full z-20"
            >
              
              {/* PAGE FRONT (The Murder Board) */}
              <div 
                className="absolute inset-0 w-full h-full bg-[#E3D3B5] rounded-r-md border-l border-[#C2B294] overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* Paper Texture */}
                <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
                
                <div className="relative w-full h-full">
                  {/* Red String Layer */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: "drop-shadow(2px 4px 2px rgba(0,0,0,0.4))" }}>
                    <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1 }} d={string1} fill="none" stroke="#A82020" strokeWidth="2.5" />
                    <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.5 }} d={string2} fill="none" stroke="#A82020" strokeWidth="2.5" />
                    <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 2 }} d={string3} fill="none" stroke="#A82020" strokeWidth="2.5" />
                  </svg>

                  {/* Suspect 1 (Front Profile) */}
                  <motion.div initial={{ opacity: 0, rotate: -20 }} animate={{ opacity: 1, rotate: -6 }} transition={{ delay: 0.8 }} className="absolute top-12 left-12 w-32 bg-white p-2 pb-6 shadow-xl z-20">
                    <img src="/suspect1.jpg" alt="Suspect" className="w-full aspect-[3/4] object-cover grayscale contrast-125" />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-700 shadow-md border border-red-900" />
                    <p className="mt-1 text-center font-handwriting text-black/80 font-bold -rotate-2 text-sm">VICTOR DRAVEN</p>
                  </motion.div>

                  {/* Crime Scene */}
                  <motion.div initial={{ opacity: 0, rotate: 20 }} animate={{ opacity: 1, rotate: 4 }} transition={{ delay: 1.2 }} className="absolute top-8 right-12 w-40 bg-white p-2 pb-6 shadow-xl z-20">
                    <img src="/crimescene.jpg" alt="Crime Scene" className="w-full aspect-[4/3] object-cover contrast-125 saturate-50" />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-700 shadow-md border border-red-900" />
                    <p className="mt-1 text-center font-handwriting text-black/80 font-bold rotate-1 text-sm">ALLEYWAY #4</p>
                  </motion.div>

                  {/* Suspect 2 (Side Profile) */}
                  <motion.div initial={{ opacity: 0, rotate: -15 }} animate={{ opacity: 1, rotate: 12 }} transition={{ delay: 1.6 }} className="absolute bottom-32 right-16 w-32 bg-white p-2 pb-6 shadow-xl z-20">
                    <img src="/suspect2.jpg" alt="Suspect Side" className="w-full aspect-[3/4] object-cover grayscale contrast-125" />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-700 shadow-md border border-red-900" />
                    <p className="mt-1 text-center font-handwriting text-black/80 font-bold -rotate-2 text-xs">SIGHTING - OCT 14</p>
                  </motion.div>

                  {/* HTML/CSS Blood Analytics Report */}
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className="absolute bottom-8 left-8 w-56 h-64 bg-[#f4f4f4] shadow-2xl p-4 z-10 -rotate-3 border border-gray-300">
                    <div className="absolute -top-4 right-12 w-6 h-12 bg-gray-400 rounded-full opacity-80 shadow-md rotate-12" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 80%)" }} /> {/* Paperclip */}
                    
                    <h2 className="font-mono text-[10px] font-bold border-b border-black pb-1 mb-2">METROPOLITAN FORENSICS - TOXICOLOGY</h2>
                    
                    {/* CSS Blood Splatter */}
                    <div className="absolute top-16 right-4 w-12 h-12 bg-red-700/80 rounded-full blur-[1px] mix-blend-multiply" style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }} />
                    <div className="absolute top-24 right-16 w-4 h-4 bg-red-700/80 rounded-full blur-[0.5px] mix-blend-multiply" />
                    <div className="absolute top-12 right-2 w-2 h-2 bg-red-700/80 rounded-full blur-[0.5px] mix-blend-multiply" />
                    
                    <table className="w-full font-mono text-[8px] mt-4 text-black">
                      <tbody>
                        <tr className="border-b border-gray-300"><td className="py-1 font-bold">SAMPLE ID:</td><td className="py-1">#4920-B</td></tr>
                        <tr className="border-b border-gray-300"><td className="py-1 font-bold">BLOOD TYPE:</td><td className="py-1">O NEGATIVE</td></tr>
                        <tr className="border-b border-gray-300"><td className="py-1 font-bold">DNA MATCH:</td><td className="py-1 text-red-700 font-bold">DRAVEN, V.</td></tr>
                        <tr className="border-b border-gray-300"><td className="py-1 font-bold">TOXIN LVL:</td><td className="py-1">0.14mg/L</td></tr>
                      </tbody>
                    </table>
                  </motion.div>

                  {/* Turn Page Button */}
                  <button 
                    onClick={() => setPageFlipped(true)}
                    className="absolute bottom-6 right-6 font-handwriting text-3xl font-bold text-red-800 hover:text-red-600 transition-colors z-50 mix-blend-multiply"
                  >
                    Turn Page &rarr;
                  </button>
                </div>
              </div>

              {/* PAGE BACK (The back of the flipped page, blank manila) */}
              <div 
                className="absolute inset-0 w-full h-full bg-[#D6C4A3] rounded-l-md border-r border-[#C2B294]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                 <div className="absolute inset-0 opacity-[0.3] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
                 
                 {/* A faint coffee stain on the back of the page */}
                 <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border-4 border-amber-900/10 mix-blend-multiply" />
              </div>

            </motion.div>
          </div>
        </motion.div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
      `}</style>
    </AnimatePresence>
  );
}
