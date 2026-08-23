"use client";

import React, { useMemo } from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  bleedDensity?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className = "",
  bleedDensity = 0.06,
}) => {
  const characters = useMemo(() => {
    return text.split("").map((char, index) => {
      // Deterministic mechanical variance based on character code and index
      const rand1 = Math.abs(Math.sin(index * 997 + char.charCodeAt(0)));
      const rand2 = Math.abs(Math.cos(index * 331 + char.charCodeAt(0)));

      const opacity = 0.82 + rand1 * 0.18; // 0.82 to 1.0 opacity
      const yOffset = (rand2 - 0.5) * 0.8; // Baseline jiggle (-0.4px to +0.4px)
      const isHeavyStrike = rand1 < bleedDensity;

      return {
        char,
        opacity,
        yOffset,
        isHeavyStrike,
      };
    });
  }, [text, bleedDensity]);

  return (
    <span className={`font-mono inline-block tracking-wider select-text ${className}`}>
      {characters.map((item, idx) => (
        <span
          key={idx}
          style={{
            opacity: item.opacity,
            transform: `translateY(${item.yOffset}px)`,
            filter: item.isHeavyStrike ? "drop-shadow(0 0 0.5px rgba(20,20,20,0.85))" : "none",
            fontWeight: item.isHeavyStrike ? 600 : 400,
          }}
          className="inline-block transition-opacity"
        >
          {item.char === " " ? "\u00A0" : item.char}
        </span>
      ))}
    </span>
  );
};
