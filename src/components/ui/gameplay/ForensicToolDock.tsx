"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";

export default function ForensicToolDock() {
  const activeForensicTool = useCaseStore((s) => s.activeForensicTool);
  const setForensicTool = useCaseStore((s) => s.setForensicTool);

  const tools = [
    {
      id: "uv_blacklight" as const,
      label: "UV FILTER",
      activeColor: "border-purple-500 bg-purple-900/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
      activeIconColor: "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      id: "dictaphone" as const,
      label: "RECORDER",
      activeColor: "border-red-600 bg-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.4)]",
      activeIconColor: "text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="8" cy="12" r="2.5" /><circle cx="16" cy="12" r="2.5" />
          <line x1="10.5" y1="12" x2="13.5" y2="12" />
        </svg>
      ),
    },
    {
      id: "magnifier" as const,
      label: "LENS",
      activeColor: "border-amber-600 bg-amber-900/30 shadow-[0_0_15px_rgba(217,119,6,0.4)]",
      activeIconColor: "text-amber-500 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2.5 bg-pitch/80 backdrop-blur-md border border-zinc-700/50 rounded-sm shadow-xl z-30">
      {tools.map((tool) => {
        const isActive = activeForensicTool === tool.id;
        return (
          <div key={tool.id} className="flex flex-col items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setForensicTool(isActive ? "none" : tool.id)}
              className={`relative p-3 rounded-sm border transition-all duration-300 ${
                isActive
                  ? tool.activeColor
                  : "border-zinc-700 bg-leather/50 hover:bg-leather"
              }`}
            >
              <span className={isActive ? tool.activeIconColor : "text-zinc-500"}>
                {tool.icon}
              </span>
            </motion.button>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              {tool.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
