"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Folder, AlertTriangle, Eye } from "lucide-react";
import { TypewriterText } from "./TypewriterText";
import { ForensicRubberStamp } from "./ForensicRubberStamp";
import { ForensicBloodSpatter } from "./ForensicBloodSpatter";
import MicroCassetteDictaphone from "./MicroCassetteDictaphone";
import { forensicAudio } from "../../lib/forensicAudio";

export const ForensicDeskShowcase: React.FC = () => {
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"autopsy" | "evidence" | "suspect">("autopsy");

  const toggleFolder = () => {
    forensicAudio.playFolderOpen();
    setIsFolderOpen(!isFolderOpen);
  };

  return (
    <div className="relative w-full min-h-screen texture-dark-oak overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 select-none">
      {/* ── Inverse-Square Radial Desk Lamp Light Falloff ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255, 235, 190, 0.14) 0%, rgba(200, 150, 70, 0.05) 45%, rgba(0, 0, 0, 0.88) 85%)",
        }}
      />

      {/* ── Floating Optical Dust Motes in Lamp Beam ── */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-200/40 absolute top-1/4 left-1/3 animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-amber-100/30 absolute top-1/3 left-1/2 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-amber-300/20 absolute top-1/2 left-2/5 animate-pulse" />
      </div>

      {/* ── Main Desk Layout ── */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Micro-Cassette Dictaphone & Desk Evidence Tools */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-6">
          <MicroCassetteDictaphone />

          {/* Quick Desk Controls */}
          <button
            onClick={toggleFolder}
            onMouseEnter={() => forensicAudio.playPenFriction()}
            className="w-64 py-3 px-4 rounded bg-[#1e1914] border border-[#423629] text-[#d4c5a9] font-mono text-xs tracking-wider flex items-center justify-between shadow-xl hover:bg-[#2c241c] transition-colors"
          >
            <span>{isFolderOpen ? "SEAL ARCHIVE FOLDER" : "OPEN CASE FILE #1094"}</span>
            <Folder size={16} />
          </button>
        </div>

        {/* Right Side: 300 GSM Kraft Pressboard Case Folder */}
        <div className="lg:col-span-8 w-full flex justify-center">
          <motion.div
            layout
            className="relative w-full max-w-2xl rounded-lg texture-kraft-pressboard p-6 md:p-8 min-h-[580px] text-[#2a241e]"
          >
            {/* Paperclip Props with Specular Reflection */}
            <div className="absolute -top-3 right-12 w-4 h-14 rounded-full border-2 border-gray-400 paperclip-metallic z-30 pointer-events-none" />
            <div className="absolute -top-2 right-8 w-4 h-12 rounded-full border-2 border-gray-400 paperclip-metallic z-30 pointer-events-none" />

            {/* Folder Header / Tab Seal */}
            <div className="flex justify-between items-start border-b-2 border-[#57412b]/40 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#422f1d] text-[#e8dfcf] px-2 py-0.5 text-[10px] font-mono tracking-widest font-bold rounded-sm">
                    POLICE ARCHIVE
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-[#57412b] font-bold">
                    DEPT. OF FORENSIC PATHOLOGY
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-mono font-bold tracking-tight text-[#1c150e] mt-1">
                  CASE FILE: MORTIS-78-09
                </h1>
              </div>

              {/* Rubber Stamp */}
              <ForensicRubberStamp label="EVIDENCE SEALED" date="OCT 14 1978" rotation={-6} />
            </div>

            {/* Document Navigation Tabs */}
            <div className="flex gap-2 border-b border-[#57412b]/30 pb-2 mb-6 font-mono text-xs">
              {(["autopsy", "evidence", "suspect"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    forensicAudio.playPenFriction();
                    setActiveTab(tab);
                  }}
                  className={`px-3 py-1 rounded font-bold uppercase transition-all ${
                    activeTab === tab
                      ? "bg-[#382617] text-[#f0e8d8] shadow"
                      : "text-[#57412b] hover:bg-[#57412b]/10"
                  }`}
                >
                  {tab === "autopsy" && "I. Post-Mortem Report"}
                  {tab === "evidence" && "II. Photographic Scans"}
                  {tab === "suspect" && "III. Latent Prints"}
                </button>
              ))}
            </div>

            {/* Inner Document Parchment Sheets */}
            <div className="relative bg-[#f5ebd7] p-6 rounded shadow-inner border border-[#d6c4a5] min-h-[360px] overflow-hidden">
              {/* Paper Watermark / Header */}
              <div className="flex justify-between text-[9px] font-mono text-[#80725c] border-b border-[#ded0b6] pb-2 mb-4">
                <span>FORM 88-B FORENSIC RECORD</span>
                <span>ARCHIVE COPY — DO NOT REMOVE</span>
              </div>

              {/* TAB 1: AUTOPSY REPORT */}
              {activeTab === "autopsy" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="relative">
                    <TypewriterText
                      className="text-xs text-[#2b241c] leading-relaxed block"
                      text="VICTIM: UNIDENTIFIED CAUCASIAN MALE (EST. 35-40 YRS). DISCOVERED AT 03:40 HOURS IN ABANDONED SECTOR 4 MILL. CAUSE OF DEATH: EXTENSIVE BLUNT FORCE CRANIAL TRAUMA WITH EVIDENCE OF EXSANGUINATION. OXIDIZED ARTERIAL SPATTER PATTERNS INDICATE IMPACT AT POINT OF SEATED CONFINEMENT."
                    />
                  </div>

                  <div className="border-t border-[#ded0b6] pt-3 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] font-mono text-[#8a7a65] block font-bold">
                        CHIEF MEDICAL EXAMINER
                      </span>
                      <span className="font-serif italic text-sm text-[#571b1b] font-bold">
                        Dr. H. Vance, M.D.
                      </span>
                    </div>

                    {/* Forensic Clotted Blood Spatter Overlay */}
                    <div className="absolute right-4 bottom-2 pointer-events-none">
                      <ForensicBloodSpatter size={130} dripLength={50} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PHOTOGRAPHIC SCANS (35mm POLAROID) */}
              {activeTab === "evidence" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-6 items-center justify-around py-4"
                >
                  {/* Polaroid Frame #1 */}
                  <div className="relative w-44 polaroid-frame p-2.5 pb-6 transform -rotate-2">
                    <div className="relative w-full h-36 bg-[#171412] overflow-hidden rounded-sm border border-black/40">
                      {/* Photographic developer streak */}
                      <div className="absolute inset-0 polaroid-chemical-streak pointer-events-none" />
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <AlertTriangle className="text-amber-500/80 mb-1" size={24} />
                        <span className="text-[9px] font-mono text-[#a89b87]">CRIME SCENE #01</span>
                        <span className="text-[8px] font-mono text-[#736857]">POINT OF ENTRY</span>
                      </div>
                    </div>
                    <span className="block text-center font-handwriting text-xs text-[#421b1b] mt-2 font-bold">
                      Basement hatch lock - Oct 14
                    </span>
                  </div>

                  {/* Polaroid Frame #2 */}
                  <div className="relative w-44 polaroid-frame p-2.5 pb-6 transform rotate-3">
                    <div className="relative w-full h-36 bg-[#1a1311] overflow-hidden rounded-sm border border-black/40">
                      <div className="absolute inset-0 polaroid-chemical-streak pointer-events-none" />
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <Eye className="text-red-500/80 mb-1" size={24} />
                        <span className="text-[9px] font-mono text-[#a89b87]">EVIDENCE ITEM #04</span>
                        <span className="text-[8px] font-mono text-[#736857]">RECOVERED WEAPON</span>
                      </div>
                    </div>
                    <span className="block text-center font-handwriting text-xs text-[#421b1b] mt-2 font-bold">
                      Iron crowbar w/ hair fiber
                    </span>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: LATENT PRINT CARDS */}
              {activeTab === "suspect" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#c7b79b] p-3 rounded bg-[#f0e4cc]">
                      <span className="text-[9px] font-mono text-[#6e5f4a] block font-bold mb-1">
                        SPECIMEN A: RIGHT INDEX
                      </span>
                      <div className="w-full h-28 bg-[#211a14] rounded flex items-center justify-center p-2 relative overflow-hidden">
                        {/* Ridge Bifurcation Latent Print Texture */}
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full opacity-60 text-[#dfd4c0] stroke-current fill-none stroke-[1.2]"
                        >
                          <circle cx="50" cy="50" r="10" strokeDasharray="3 2" />
                          <circle cx="50" cy="50" r="20" strokeDasharray="6 3" />
                          <circle cx="50" cy="50" r="30" strokeDasharray="8 4" />
                          <circle cx="50" cy="50" r="40" strokeDasharray="5 5" />
                        </svg>
                      </div>
                      <span className="text-[8px] font-mono text-[#8f2828] block mt-1 font-bold">
                        MATCH: 84.7% CONVERGENCE
                      </span>
                    </div>

                    <div className="border border-[#c7b79b] p-3 rounded bg-[#f0e4cc]">
                      <span className="text-[9px] font-mono text-[#6e5f4a] block font-bold mb-1">
                        SPECIMEN B: RIGHT THUMB
                      </span>
                      <div className="w-full h-28 bg-[#211a14] rounded flex items-center justify-center p-2 relative overflow-hidden">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full opacity-40 text-[#dfd4c0] stroke-current fill-none stroke-[1.2]"
                        >
                          <ellipse cx="50" cy="50" rx="14" ry="18" strokeDasharray="4 2" />
                          <ellipse cx="50" cy="50" rx="26" ry="32" strokeDasharray="6 3" />
                          <ellipse cx="50" cy="50" rx="38" ry="44" strokeDasharray="7 5" />
                        </svg>
                      </div>
                      <span className="text-[8px] font-mono text-[#57493a] block mt-1 font-bold">
                        SMUDGED / PARTIAL LIFT
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForensicDeskShowcase;
