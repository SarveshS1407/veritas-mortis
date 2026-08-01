"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, SoftShadows, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, DepthOfField, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// ── 3D RAIN PARTICLE SYSTEM ──
function RainParticles() {
  const count = 2000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: Math.random() * 20,
      z: -10 + (Math.random() * 10), // outside the window
      speed: 15 + Math.random() * 10,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    drops.forEach((drop, i) => {
      drop.y -= drop.speed * delta;
      if (drop.y < -5) drop.y = 20; // reset to top
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.scale.set(1, 4 + Math.random() * 4, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.02, 0.02, 0.5]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
    </instancedMesh>
  );
}

// ── THE ROOM & DESK ──
function NoirRoom() {
  return (
    <group>
      {/* Dark Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Dark Walls */}
      <mesh position={[-5, 5, 0]} receiveShadow>
        <boxGeometry args={[1, 10, 50]} />
        <meshStandardMaterial color="#080808" roughness={0.9} />
      </mesh>
      <mesh position={[5, 5, 0]} receiveShadow>
        <boxGeometry args={[1, 10, 50]} />
        <meshStandardMaterial color="#080808" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>

      {/* Main Back Wall (with hole for window) */}
      <mesh position={[-6, 5, -8]}><boxGeometry args={[6, 10, 1]}/><meshStandardMaterial color="#050505"/></mesh>
      <mesh position={[6, 5, -8]}><boxGeometry args={[6, 10, 1]}/><meshStandardMaterial color="#050505"/></mesh>
      <mesh position={[0, 9, -8]}><boxGeometry args={[6, 2, 1]}/><meshStandardMaterial color="#050505"/></mesh>
      <mesh position={[0, 1, -8]}><boxGeometry args={[6, 2, 1]}/><meshStandardMaterial color="#050505"/></mesh>
      {/* Window Crossbar */}
      <mesh position={[0, 5, -7.5]}><boxGeometry args={[6, 0.2, 0.2]}/><meshStandardMaterial color="#000000"/></mesh>
      <mesh position={[0, 5, -7.5]}><boxGeometry args={[0.2, 6, 0.2]}/><meshStandardMaterial color="#000000"/></mesh>

      {/* The Detective's Desk */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.2, 2.5]} />
          <meshStandardMaterial color="#1a120b" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Legs */}
        <mesh position={[-1.8, 0.75, -1]} castShadow><boxGeometry args={[0.2, 1.5, 0.2]}/><meshStandardMaterial color="#000000"/></mesh>
        <mesh position={[1.8, 0.75, -1]} castShadow><boxGeometry args={[0.2, 1.5, 0.2]}/><meshStandardMaterial color="#000000"/></mesh>
        <mesh position={[-1.8, 0.75, 1]} castShadow><boxGeometry args={[0.2, 1.5, 0.2]}/><meshStandardMaterial color="#000000"/></mesh>
        <mesh position={[1.8, 0.75, 1]} castShadow><boxGeometry args={[0.2, 1.5, 0.2]}/><meshStandardMaterial color="#000000"/></mesh>
      </group>

      {/* The Case File Dossier */}
      <mesh position={[0, 1.62, 0.2]} rotation={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.02, 1.1]} />
        <meshStandardMaterial color="#A09888" roughness={0.9} />
      </mesh>
      {/* Top Paper inside file */}
      <mesh position={[0.02, 1.63, 0.2]} rotation={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.75, 0.005, 1.05]} />
        <meshStandardMaterial color="#E8E3D9" roughness={0.8} />
      </mesh>

      {/* A small desk lamp */}
      <group position={[-1.2, 1.6, -0.5]}>
        <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.2, 0.3, 0.2]}/><meshStandardMaterial color="#2a2a2a"/></mesh>
        <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.05, 0.05, 1.5]}/><meshStandardMaterial color="#8a6b32" metalness={0.8}/></mesh>
        <mesh position={[0.4, 1.3, 0]} rotation={[0, 0, -0.5]}><sphereGeometry args={[0.2]}/><meshStandardMaterial color="#8a6b32" metalness={0.8}/></mesh>
      </group>
    </group>
  );
}

// ── CAMERA RIG ──
function FirstPersonCamera({ 
  onReachDesk, 
  opened 
}: { 
  onReachDesk: () => void,
  opened: boolean
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [reached, setReached] = useState(false);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;
    
    const cam = cameraRef.current;
    
    if (!reached) {
      // Walking Phase
      const targetZ = 2.5; // distance from desk
      const walkSpeed = 1.8;
      
      cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetZ, walkSpeed * delta);
      
      // Head Bobbing (only while moving)
      if (cam.position.z > targetZ + 0.1) {
        cam.position.y = 3.5 + Math.sin(state.clock.elapsedTime * 6) * 0.1;
      } else {
        // Reached the desk
        setReached(true);
        onReachDesk();
      }
    } else {
      // At the desk
      if (!opened) {
        // Idle breathing
        cam.position.y = THREE.MathUtils.lerp(cam.position.y, 3.5 + Math.sin(state.clock.elapsedTime * 2) * 0.02, 2 * delta);
        cam.rotation.x = THREE.MathUtils.lerp(cam.rotation.x, -0.2, 2 * delta); // Look slightly down
      } else {
        // Opened -> Rapid zoom into the file
        cam.position.y = THREE.MathUtils.lerp(cam.position.y, 1.8, 4 * delta);
        cam.position.z = THREE.MathUtils.lerp(cam.position.z, 0.5, 4 * delta);
        cam.rotation.x = THREE.MathUtils.lerp(cam.rotation.x, -Math.PI / 2 + 0.1, 4 * delta); // Look straight down at file
      }
    }
  });

  return (
    <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 3.5, 12]} fov={50} />
  );
}

export default function CinematicWalkSequence() {
  const [atDesk, setAtDesk] = useState(false);
  const [opened, setOpened] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleOpen = useCallback(() => {
    if (!atDesk || opened) return;
    
    // Play Stinger
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 1);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1);
    } catch(e) {}

    setOpened(true);
    setTimeout(() => setShowMenu(true), 800);
  }, [atDesk, opened]);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden select-none">
      
      {/* ── 3D CANVAS ── */}
      <Canvas shadows onClick={handleOpen}>
        <SoftShadows size={10} samples={16} focus={0.5} />
        
        <FirstPersonCamera onReachDesk={() => setAtDesk(true)} opened={opened} />
        
        {/* Cinematic Sunset Environment */}
        <Environment preset="sunset" background backgroundBlurriness={0.5} />
        
        {/* Ambient light so it's not pitch black */}
        <ambientLight intensity={0.2} color="#ffffff" />
        
        {/* The Sunset light blasting through the window */}
        <spotLight 
          position={[0, 5, -15]} 
          angle={0.8} 
          penumbra={1} 
          intensity={150} 
          color="#ff4400" 
          castShadow
        />
        
        {/* Subtle desk lamp ambient glow */}
        <pointLight position={[-1, 2, 0]} intensity={10} color="#ffaa55" distance={5} />

        <NoirRoom />
        <RainParticles />
        
        {/* AAA Post Processing */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.4} mipmapBlur intensity={1.5} />
          <DepthOfField 
            target={opened ? [0, 1.6, 0.2] : [0, 1.6, 0.2]} // Focus on the file
            focalLength={0.05} 
            bokehScale={opened ? 0 : 8} // Blur background aggressively when not opened
            height={480} 
          />
          <Noise opacity={0.04} />
          <Vignette eskil={false} offset={0.1} darkness={1.2} />
        </EffectComposer>
      </Canvas>

      {/* ── PROMPT ── */}
      <AnimatePresence>
        {atDesk && !opened && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <p className="font-cinzel text-sm tracking-[0.4em] text-[#E8E3D9] animate-pulse drop-shadow-[0_0_10px_rgba(0,0,0,1)]">
              [ CLICK TO OPEN DOSSIER ]
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MENU OVERLAY ── */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)", backgroundColor: "rgba(0,0,0,0.7)" }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-40 p-8"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="text-center mb-16"
            >
              <h1 className="font-cinzel text-5xl md:text-7xl font-black tracking-[0.2em] text-[#E8E3D9] drop-shadow-[0_0_30px_rgba(232,227,217,0.4)] leading-tight">
                VERITAS<br/>MORTIS
              </h1>
              <div className="w-24 h-[1px] bg-[#8B0000] mx-auto mt-6 mb-4 opacity-70 shadow-[0_0_10px_rgba(139,0,0,0.8)]" />
              <p className="font-cinzel text-xs tracking-[0.6em] text-[#A09888] uppercase">
                Case No. 2049
              </p>
            </motion.div>

            <div className="w-full max-w-sm space-y-3">
              {[
                "BEGIN INVESTIGATION",
                "EXAMINE EVIDENCE",
                "SYSTEM SETTINGS"
              ].map((label, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    x: 15, 
                    backgroundColor: "rgba(139,0,0,0.1)",
                    color: "#ffffff",
                    letterSpacing: "0.4em"
                  }}
                  transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                  className="relative flex items-center justify-between w-full py-4 px-6 border border-[#A09888]/20 bg-black/40 backdrop-blur-sm rounded-sm text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#D4C5A9] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.8)] group overflow-hidden"
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B0000] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  <span className="font-cinzel relative z-10">{label}</span>
                  <span className="text-[#8B0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300">►</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
      `}</style>
    </div>
  );
}
