"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface WindowLightProps {
  className?: string;
}

/**
 * WindowLight Component
 * 
 * A purely decorative environmental element providing ambient moonlight,
 * occasional lightning flashes, and passing vehicle shadows.
 * 
 * Contributes to the neo-noir atmosphere of Veritas Mortis.
 */
export function WindowLight({ className = "" }: WindowLightProps) {
  const [lightningFlash, setLightningFlash] = useState(0);
  const [vehicleShadow, setVehicleShadow] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();

  // Lightning effect hook
  useEffect(() => {
    if (shouldReduceMotion) return;

    let lightningTimer: NodeJS.Timeout;

    const triggerLightning = () => {
      // Double-flash pattern
      // Flash 1
      setLightningFlash(0.08);
      
      setTimeout(() => {
        setLightningFlash(0);
        
        // Flash 2
        setTimeout(() => {
          setLightningFlash(0.08);
          
          setTimeout(() => {
            setLightningFlash(0);
          }, 100); // 100ms duration for second flash
        }, 100); // 100ms gap between flashes
      }, 100); // 100ms duration for first flash

      // Schedule next lightning (random between 30 and 90 seconds)
      const nextDelay = Math.random() * (90000 - 30000) + 30000;
      lightningTimer = setTimeout(triggerLightning, nextDelay);
    };

    // Initial scheduling
    const initialDelay = Math.random() * (90000 - 30000) + 30000;
    lightningTimer = setTimeout(triggerLightning, initialDelay);

    return () => clearTimeout(lightningTimer);
  }, [shouldReduceMotion]);

  // Vehicle shadow effect hook
  useEffect(() => {
    if (shouldReduceMotion) return;

    let vehicleTimer: NodeJS.Timeout;

    const triggerVehicle = () => {
      setVehicleShadow(true);
      
      // Turn off after animation completes (3 seconds)
      setTimeout(() => {
        setVehicleShadow(false);
      }, 3000);

      // Schedule next vehicle (random between 45 and 120 seconds)
      const nextDelay = Math.random() * (120000 - 45000) + 45000;
      vehicleTimer = setTimeout(triggerVehicle, nextDelay);
    };

    const initialDelay = Math.random() * (120000 - 45000) + 45000;
    vehicleTimer = setTimeout(triggerVehicle, initialDelay);

    return () => clearTimeout(vehicleTimer);
  }, [shouldReduceMotion]);

  return (
    <div 
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`} 
      aria-hidden="true"
    >
      {/* Static Moonlight Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to left, rgba(140, 160, 200, 0.06) 0%, transparent 40%)"
        }}
      />
      
      {/* Lightning Flash Overlay */}
      <motion.div 
        className="absolute inset-0 bg-white"
        animate={{ opacity: lightningFlash }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Passing Vehicle Shadow */}
      <AnimatePresence>
        {vehicleShadow && (
          <motion.div
            className="absolute top-0 bottom-0 w-[40vw] bg-black/10 blur-xl"
            initial={{ x: "100vw", skewX: -20 }}
            animate={{ x: "-60vw", skewX: -20 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 3, ease: "linear" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
