"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const settings = useCaseStore((s) => s.settings);
  const updateSettings = useCaseStore((s) => s.updateSettings);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#121010] text-[#E8E3D9] border-2 border-[#5C4A38] rounded-sm shadow-2xl p-6 md:p-8 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3B2A1E] pb-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A6830]" />
            <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#E8E3D9]">
              INVESTIGATOR SETTINGS & CONFIG
            </h2>
          </div>
          <button
            onClick={() => {
              forensicAudio.playPhotoInspect();
              onClose();
            }}
            className="px-3 py-1 bg-[#2A1808] hover:bg-red-900 font-mono text-xs text-[#EDE8D5] rounded-sm transition-colors cursor-pointer"
          >
            ✕ CLOSE [ESC]
          </button>
        </div>

        {/* Options Stack */}
        <div className="space-y-6 font-mono text-xs">
          {/* 1. Master Audio & Mute */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#D4C5A9] uppercase tracking-wide">
                Master Audio & Synthesizer
              </span>
              <button
                onClick={() => {
                  const nextMuted = !settings.isMuted;
                  updateSettings({ isMuted: nextMuted });
                  if (!nextMuted) forensicAudio.playFolderOpen();
                }}
                className={`px-3 py-1 border rounded-sm uppercase tracking-wider font-bold transition-colors ${
                  settings.isMuted
                    ? "bg-[#6B0000] border-red-500 text-white"
                    : "bg-[#1A1714] border-[#3B2A1E] text-neutral-400 hover:text-white"
                }`}
              >
                {settings.isMuted ? "MUTED [OFF]" : "ACTIVE [ON]"}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-neutral-500 w-16">VOLUME:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.isMuted ? 0 : settings.masterVolume}
                disabled={settings.isMuted}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateSettings({ masterVolume: val });
                }}
                className="w-full accent-[#8B0000] cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400 w-10 text-right">
                {Math.round((settings.isMuted ? 0 : settings.masterVolume) * 100)}%
              </span>
            </div>
          </div>

          {/* 2. Text Speed */}
          <div className="pt-4 border-t border-[#2A1808] space-y-2">
            <span className="font-bold text-[#D4C5A9] uppercase tracking-wide block">
              Typewriter Teletype Speed
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["slow", "normal", "instant"] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    forensicAudio.playTypewriterKey();
                    updateSettings({ textSpeed: speed });
                  }}
                  className={`py-2 px-3 border rounded-sm text-center uppercase tracking-wider transition-colors ${
                    settings.textSpeed === speed
                      ? "bg-[#8B0000] border-red-500 text-white font-bold"
                      : "bg-[#160F0B] border-[#3B2A1E] text-neutral-400 hover:text-white"
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Reduced Motion & Visual Comfort */}
          <div className="pt-4 border-t border-[#2A1808] space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-[#D4C5A9] uppercase tracking-wide block">
                  Reduced Motion
                </span>
                <span className="text-[10px] text-neutral-500">
                  Minimize camera parallax and shaking animations
                </span>
              </div>
              <button
                onClick={() => {
                  forensicAudio.playPhotoInspect();
                  updateSettings({ reducedMotion: !settings.reducedMotion });
                }}
                className={`px-3 py-1 border rounded-sm uppercase tracking-wider font-bold transition-colors ${
                  settings.reducedMotion
                    ? "bg-[#8A6830] border-amber-500 text-white"
                    : "bg-[#1A1714] border-[#3B2A1E] text-neutral-400 hover:text-white"
                }`}
              >
                {settings.reducedMotion ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-[#D4C5A9] uppercase tracking-wide block">
                  35mm Film Grain Overlay
                </span>
                <span className="text-[10px] text-neutral-500">
                  Subtle vintage analog cinematic texture
                </span>
              </div>
              <button
                onClick={() => {
                  forensicAudio.playPhotoInspect();
                  updateSettings({ filmGrainEnabled: !settings.filmGrainEnabled });
                }}
                className={`px-3 py-1 border rounded-sm uppercase tracking-wider font-bold transition-colors ${
                  settings.filmGrainEnabled
                    ? "bg-[#160F0B] border-[#5C4A38] text-white"
                    : "bg-[#1A1714] border-[#3B2A1E] text-neutral-500"
                }`}
              >
                {settings.filmGrainEnabled ? "ACTIVE" : "OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#3B2A1E] flex justify-between items-center font-mono text-[10px] text-neutral-500">
          <span>PREFERENCES SAVED AUTOMATICALLY</span>
          <button
            onClick={() => {
              forensicAudio.playPhotoInspect();
              onClose();
            }}
            className="text-[#D4C5A9] hover:underline"
          >
            Apply & Return →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
