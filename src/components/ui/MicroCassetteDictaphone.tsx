"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Mic, AlertCircle } from "lucide-react";
import { forensicAudio } from "@/lib/forensicAudio";
import { useCrimeAudio } from "@/hooks/useCrimeAudio";

interface MicroCassetteDictaphoneProps {
  /** Optional audio file URL for recorded voice memo or wiretap (root-relative) */
  audioSrc?: string;
  className?: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function MicroCassetteDictaphone({
  className = "",
  onPlayStateChange,
}: MicroCassetteDictaphoneProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [counter, setCounter] = useState(0);

  const { isPlaying, isLoading, hasError, errorMessage, play, stop, resumeAudioContext } =
    useCrimeAudio();

  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Tape counter animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCounter((prev) => (prev + 1) % 999);
      }, 150);
    } else {
      if (counter === 0) setCounter(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying, counter]);

  const handlePlay = async () => {
    await resumeAudioContext();

    if (isPlaying) {
      forensicAudio.playDictaphoneSwitch("stop");
      stop();
    } else {
      forensicAudio.playDictaphoneSwitch("play");
      setIsRecording(false);
      await play();
    }
  };

  const handleStop = () => {
    forensicAudio.playDictaphoneSwitch("stop");
    stop();
    setIsRecording(false);
  };

  const handleRecord = async () => {
    await resumeAudioContext();
    forensicAudio.playDictaphoneSwitch(isRecording ? "stop" : "play");
    if (!isRecording) {
      setIsRecording(true);
      await play();
    } else {
      setIsRecording(false);
      stop();
    }
  };

  return (
    <div
      className={`relative w-64 h-96 rounded-xl texture-brushed-steel p-4 border border-[#404650] flex flex-col justify-between shadow-2xl select-none transition-colors ${
        isPlaying ? "shadow-[0_0_30px_rgba(0,0,0,0.9)]" : ""
      } ${className}`}
    >
      {/* Metallic Chassis Bevel */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border-t border-white/20 border-b border-black/80" />

      {/* Header: Brand & Microphone Grille */}
      <div className="flex justify-between items-center border-b border-black/50 pb-2">
        <div>
          <span className="text-[9px] font-mono tracking-widest text-[#8a95a5] block font-bold">
            SONY M-530V
          </span>
          <span className="text-[7px] font-mono tracking-wider text-[#5f6874] block">
            EVIDENCE WIRETAP ARCHIVE
          </span>
        </div>

        {/* Microphone Mesh Grille */}
        <div className="w-10 h-8 rounded bg-[#15171a] p-1 border border-black/80 flex flex-wrap gap-0.5 justify-center items-center">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-[#30363f]" />
          ))}
        </div>
      </div>

      {/* Clear Acrylic Cassette Compartment Window */}
      <div className="relative w-full h-36 bg-[#0c0d0f] rounded-md border-2 border-[#20242a] p-2 overflow-hidden shadow-inner flex flex-col justify-between">
        {/* Acrylic Glare Reflection */}
        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />

        {/* Cassette Shell & Tape Spools */}
        <div className="relative z-10 w-full h-full bg-[#1e1c18] rounded border border-[#3b362f] p-2 flex flex-col justify-between">
          <div className="flex justify-between text-[7px] font-mono text-[#b3a894] px-2 font-bold items-center">
            <span className="text-red-500 font-mono">CASE EVIDENCE #09</span>
            <span>SIDE A</span>
          </div>

          {/* Spool Drive Mechanism — Spins when actively playing */}
          <div className="flex justify-around items-center my-1">
            {/* Left Spool */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-[#5c5344] bg-[#2d2820] flex items-center justify-center relative"
            >
              <div className="w-3 h-3 rounded-full bg-[#131210] border border-[#7a6f5b]" />
              <div className="absolute w-1 h-8 bg-[#473f32] rotate-45" />
              <div className="absolute w-1 h-8 bg-[#473f32] -rotate-45" />
            </motion.div>

            {/* Center Tape Window */}
            <div className="w-14 h-6 bg-[#0e0d0c] rounded border border-[#3f392f] flex items-center justify-center">
              <div className="w-10 h-2 bg-[#42220f] rounded-sm opacity-80" />
            </div>

            {/* Right Spool */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-[#5c5344] bg-[#2d2820] flex items-center justify-center relative"
            >
              <div className="w-3 h-3 rounded-full bg-[#131210] border border-[#7a6f5b]" />
              <div className="absolute w-1 h-8 bg-[#473f32] rotate-45" />
              <div className="absolute w-1 h-8 bg-[#473f32] -rotate-45" />
            </motion.div>
          </div>

          <div className="h-1 bg-[#26150a] w-full rounded-full" />
        </div>
      </div>

      {/* Mechanical Counter & Status LED */}
      <div className="flex justify-between items-center px-1">
        {/* Analog Tape Counter */}
        <div className="flex items-center gap-1 bg-[#0f1114] px-2 py-1 rounded border border-[#2a2f38]">
          <span className="text-[10px] font-mono font-bold text-[#c4b998] tracking-widest">
            {String(counter).padStart(3, "0")}
          </span>
        </div>

        {/* Diagnostic Error Indicator */}
        {hasError && (
          <div className="flex items-center gap-1 text-[8px] font-mono text-amber-500/80" title={errorMessage || "Audio fallback mode"}>
            <AlertCircle size={10} />
            <span>ERROR</span>
          </div>
        )}

        {/* LED Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-[#8a95a5]">WIRETAP</span>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-[#ff1a1a] shadow-[0_0_8px_#ff0000]"
                : isPlaying
                ? "bg-[#00e676] shadow-[0_0_6px_#00e676]"
                : "bg-[#331111]"
            }`}
          />
        </div>
      </div>

      {/* Tactile Spring-Loaded Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/60">
        {/* Play Button */}
        <button
          onClick={handlePlay}
          onMouseEnter={() => forensicAudio.playPenFriction()}
          disabled={isLoading}
          className={`h-11 rounded bg-gradient-to-b from-[#3a414b] to-[#1c2026] border border-[#4a5360] flex flex-col items-center justify-center text-[#d1d5db] active:translate-y-0.5 shadow-md ${
            isPlaying ? "border-emerald-500/50 bg-[#252c34]" : ""
          } disabled:opacity-50`}
        >
          <Play size={14} className={isPlaying ? "text-emerald-400 fill-emerald-400" : ""} />
          <span className="text-[7px] font-mono font-bold mt-0.5">PLAY</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          onMouseEnter={() => forensicAudio.playPenFriction()}
          className="h-11 rounded bg-gradient-to-b from-[#3a414b] to-[#1c2026] border border-[#4a5360] flex flex-col items-center justify-center text-[#d1d5db] active:translate-y-0.5 shadow-md"
        >
          <Square size={13} />
          <span className="text-[7px] font-mono font-bold mt-0.5">STOP</span>
        </button>

        {/* Record Button */}
        <button
          onClick={handleRecord}
          onMouseEnter={() => forensicAudio.playPenFriction()}
          className={`h-11 rounded bg-gradient-to-b from-[#4a2020] to-[#250d0d] border border-[#6b2c2c] flex flex-col items-center justify-center text-[#fca5a5] active:translate-y-0.5 shadow-md ${
            isRecording ? "border-red-500 bg-[#3a1414]" : ""
          }`}
        >
          <Mic size={14} className={isRecording ? "animate-pulse text-red-400" : ""} />
          <span className="text-[7px] font-mono font-bold mt-0.5">REC</span>
        </button>
      </div>
    </div>
  );
}
