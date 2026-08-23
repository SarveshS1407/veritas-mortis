"use client";

import React from "react";

/**
 * RoomEnvironment — blurred background office atmosphere.
 * Archive shelves, filing cabinets, hanging documents, police evidence boxes.
 * Lives at z-[1] behind DeskSurface, very soft depth-of-field blur.
 * Never distracts from the desk action.
 */
export const RoomEnvironment = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-[1] overflow-hidden ${className}`}
      style={{ filter: "blur(8px) brightness(0.45) saturate(0.6)", opacity: 0.85 }}
    >
      {/* ── Background colour wash ── */}
      <div className="absolute inset-0" style={{ backgroundColor: "#1A1410" }} />

      {/* ── Archive Shelf (back wall, right side) ── */}
      <div className="absolute right-0 top-0 bottom-0 w-[22%]"
        style={{ borderLeft: "4px solid #2E2218", backgroundColor: "#1E1610" }}>
        {/* Shelf boards */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-full" style={{
            top: `${10 + i * 14}%`, height: "3px",
            backgroundColor: "#2E2218", boxShadow: "0 2px 4px rgba(0,0,0,0.8)"
          }} />
        ))}
        {/* File folders on shelves */}
        {[...Array(6)].map((_, shelf) => (
          [...Array(5)].map((_, f) => (
            <div key={`${shelf}-${f}`} className="absolute"
              style={{
                top: `${12 + shelf * 14}%`, left: `${f * 20 + 2}%`,
                width: "16%", height: "10%",
                backgroundColor: f % 3 === 0 ? "#3D2814" : f % 3 === 1 ? "#2E3520" : "#2A1E18",
                borderRight: "1px solid rgba(0,0,0,0.4)",
              }} />
          ))
        ))}
        {/* Manila folder tabs */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={`t${i}`} className="absolute" style={{
            top: `${11 + i * 14}%`, left: "5%",
            width: "30%", height: "1.5%",
            backgroundColor: "#5A3E20", opacity: 0.7
          }} />
        ))}
      </div>

      {/* ── Filing Cabinet (left background) ── */}
      <div className="absolute left-0 top-0 bottom-0 w-[14%]"
        style={{ backgroundColor: "#252220", borderRight: "4px solid #1A1614" }}>
        {/* Drawer dividers */}
        {[25, 50, 75].map((top) => (
          <div key={top} className="absolute w-full h-[2px]"
            style={{ top: `${top}%`, backgroundColor: "#1A1614" }} />
        ))}
        {/* Drawer handles */}
        {[12, 37, 62, 87].map((top) => (
          <div key={top} className="absolute" style={{
            top: `${top}%`, left: "25%", width: "50%", height: "3px",
            backgroundColor: "#3A3530", borderRadius: "2px"
          }} />
        ))}
        {/* "EVIDENCE" label on top drawer */}
        <div className="absolute top-[3%] left-[8%] right-[8%] h-[8%] flex items-center justify-center"
          style={{ backgroundColor: "#1E1C18" }}>
          <div className="font-mono text-[6px] font-black tracking-widest text-center"
            style={{ color: "#C5B08A", fontSize: "7px" }}>EVIDENCE<br />DEPT. 09</div>
        </div>
      </div>

      {/* ── Hanging Documents Chain (center top background) ── */}
      <div className="absolute top-0 left-[20%] right-[26%] h-[20%] overflow-hidden">
        {/* String */}
        <div className="absolute top-[15%] left-0 right-0 h-[1px]" style={{ backgroundColor: "#3A2E24" }} />
        {/* Hanging papers */}
        {[15, 32, 50, 68, 84].map((left, i) => (
          <div key={i} className="absolute top-[14%]" style={{
            left: `${left}%`,
            width: "8%", height: "65%",
            backgroundColor: i % 2 === 0 ? "#C8B89A" : "#E5DAC0",
            transform: `rotate(${(i % 3 - 1) * 3}deg)`,
            transformOrigin: "top center",
            borderBottom: "1px solid rgba(0,0,0,0.2)",
            boxShadow: "2px 4px 8px rgba(0,0,0,0.6)",
            opacity: 0.8
          }}>
            {/* Lines on the paper */}
            {[...Array(5)].map((_, l) => (
              <div key={l} className="w-[80%] mx-auto mt-[12%]" style={{
                height: "1px", backgroundColor: "rgba(0,0,0,0.2)", marginBottom: "8px"
              }} />
            ))}
          </div>
        ))}
      </div>

      {/* ── Police Evidence Boxes (background left-center) ── */}
      <div className="absolute bottom-0 left-[14%] w-[20%] h-[30%]">
        {/* Stack of boxes */}
        {[0, 1].map((i) => (
          <div key={i} className="absolute" style={{
            bottom: `${i * 14}%`, left: 0, right: 0,
            height: "14%",
            backgroundColor: i === 0 ? "#4A3C28" : "#3A2E1E",
            border: "2px solid #2A2018",
            boxShadow: "0 4px 12px rgba(0,0,0,0.7)"
          }}>
            <div className="absolute top-1 left-2 right-2 h-[2px]" style={{ backgroundColor: "#5E4E30" }} />
            <div className="font-mono absolute top-[15%] left-[10%] text-[8px] font-black"
              style={{ color: "#A89070", fontSize: "9px" }}>
              POLICE PROPERTY<br />CASE #77-B
            </div>
          </div>
        ))}
      </div>

      {/* ── Atmospheric Depth Gradient Overlay ── */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(10,6,3,0.3) 0%, transparent 30%, transparent 70%, rgba(10,6,3,0.5) 100%)"
      }} />
    </div>
  );
};
