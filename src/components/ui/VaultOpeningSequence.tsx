"use client";

import React, { useState, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, SpotLight, PerspectiveCamera } from "@react-three/drei";
// Removed framer-motion-3d
import { motion, AnimatePresence } from "framer-motion";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// ── PROCEDURAL VAULT DOOR COMPONENT ──
function VaultDoor({ opened }: { opened: boolean }) {
  const doorGroup = useRef<THREE.Group>(null);
  const barsRef = useRef<THREE.Group>(null);
  const wheelGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!doorGroup.current || !barsRef.current || !wheelGroup.current) return;
    
    // Animate wheel (rotateZ: -Math.PI)
    const targetWheelZ = opened ? -Math.PI : 0;
    wheelGroup.current.rotation.z = THREE.MathUtils.lerp(wheelGroup.current.rotation.z, targetWheelZ, 2 * delta);
    
    // Animate bars (x: 1.5 instead of 2.5)
    // Wait until wheel is almost fully rotated
    if (wheelGroup.current.rotation.z < -Math.PI * 0.8) {
      barsRef.current.position.x = THREE.MathUtils.lerp(barsRef.current.position.x, -1, 5 * delta); // Relative offset
    }

    // Animate door swing (rotateY: -Math.PI * 0.45)
    // Wait until bars are retracted
    if (barsRef.current.position.x < -0.8) {
      const targetDoorY = opened ? -Math.PI * 0.45 : 0;
      doorGroup.current.rotation.y = THREE.MathUtils.lerp(doorGroup.current.rotation.y, targetDoorY, 1 * delta);
    }
  });

  return (
    <group ref={doorGroup} position={[-2.5, 0, 0]}>
      <group position={[2.5, 0, 0]}>
        {/* The Main Steel Door */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 6, 0.5]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.9} 
            roughness={0.4} 
            envMapIntensity={2} 
          />
        </mesh>

        {/* The Locking Bars (horizontal) */}
        <group ref={barsRef}>
          {[1.5, 0, -1.5].map((y, i) => (
            <mesh key={i} position={[2.5, y, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1.5]} />
              <meshStandardMaterial color="#4a4a4a" metalness={1} roughness={0.2} />
            </mesh>
          ))}
        </group>

        {/* The Central Brass Vault Wheel */}
        <group ref={wheelGroup} position={[0, 0, 0.3]}>
          {/* Wheel Hub */}
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.2]} />
            <meshStandardMaterial color="#8a6b32" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Wheel Spokes */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
              <cylinderGeometry args={[0.05, 0.05, 2]} />
              <meshStandardMaterial color="#8a6b32" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          {/* Wheel Outer Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.1, 16, 100]} />
            <meshStandardMaterial color="#8a6b32" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ── CAMERA CONTROLLER ──
function CameraRig({ opened }: { opened: boolean }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!group.current) return;
    
    if (!opened) {
      // Slow breathing/bobbing effect when closed
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(state.clock.elapsedTime) * 0.1, 0.05);
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, Math.sin(state.clock.elapsedTime / 2) * 0.1, 0.05);
      group.current.position.z = 5;
    } else {
      // Push forward into the dark void when opened
      const targetZ = -5;
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.8 * delta);
    }
  });

  return (
    <group ref={group}>
      <PerspectiveCamera makeDefault fov={50} />
    </group>
  );
}

// ── MAIN SEQUENCE COMPONENT ──
export default function VaultOpeningSequence() {
  const [opened, setOpened] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Audio Synthesizer for Clunk & Hiss
  const playVaultAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // 1. Heavy Metal Clunk
      const clunkOsc = ctx.createOscillator();
      clunkOsc.type = "square";
      clunkOsc.frequency.setValueAtTime(100, now);
      clunkOsc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
      
      const clunkGain = ctx.createGain();
      clunkGain.gain.setValueAtTime(1, now);
      clunkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      clunkOsc.connect(clunkGain);
      clunkGain.connect(ctx.destination);
      clunkOsc.start(now);
      clunkOsc.stop(now + 0.5);

      // 2. Hydraulic Hiss (White Noise with Filter Sweep)
      const bufferSize = ctx.sampleRate * 2.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0; i<bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const hissSource = ctx.createBufferSource();
      hissSource.buffer = buffer;
      
      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = "bandpass";
      hissFilter.frequency.setValueAtTime(5000, now + 0.2); // Start hiss slightly after clunk
      hissFilter.frequency.exponentialRampToValueAtTime(1000, now + 2.5);
      
      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0, now);
      hissGain.gain.linearRampToValueAtTime(0.5, now + 0.2);
      hissGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
      
      hissSource.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(ctx.destination);
      hissSource.start(now + 0.2);
      hissSource.stop(now + 2.5);

    } catch (e) {
      console.log("Audio skipped");
    }
  }, []);

  const handleUnlock = () => {
    if (opened) return;
    playVaultAudio();
    setOpened(true);
    // Reveal menu after camera dolly finishes
    setTimeout(() => {
      setShowMenu(true);
    }, 4500);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-[#E8E3D9] selection:bg-[#8B0000]">
      {/* ── 3D SCENE ── */}
      <div className="absolute inset-0 z-0 cursor-crosshair" onClick={handleUnlock}>
        <Canvas shadows>
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 2, 15]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <SpotLight 
            position={[0, 5, 2]} 
            angle={0.5} 
            penumbra={1} 
            intensity={1.5} 
            color="#ffffff" 
            castShadow
          />
          <SpotLight 
            position={[0, -2, -5]} 
            angle={0.8} 
            penumbra={0.5} 
            intensity={5} 
            color="#8B0000" // Eerie crimson spotlight from inside
            distance={10}
          />

          {/* Environment for Realistic Metal Reflections */}
          <Environment preset="warehouse" />

          {/* Scene Objects */}
          <CameraRig opened={opened} />
          
          <VaultDoor opened={opened} />
          
          {/* Concrete Walls */}
          <mesh position={[0, 0, -1]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>

          {/* AAA Post Processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            <Noise opacity={0.08} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* ── UI OVERLAYS ── */}
      
      {/* Pre-Impact Prompt */}
      <AnimatePresence>
        {!opened && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none"
          >
            <p className="text-xs tracking-[0.3em] text-[#A09888] animate-pulse">
              [ CLICK TO DISENGAGE HYDRAULIC VAULT LOCKS ]
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Staging inside the Vault */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="w-full max-w-md space-y-6 p-8 pointer-events-auto">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-5xl font-black tracking-widest text-[#E8E3D9] text-center mb-12 drop-shadow-[0_0_15px_rgba(232,227,217,0.5)]"
              >
                VERITAS
              </motion.h1>

              {[
                "NEW CASE MATRIX",
                "LOAD DOSSIER",
                "SECURITY LOGS"
              ].map((label, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    x: 10, 
                    backgroundColor: "rgba(139,0,0,0.2)",
                    borderColor: "#8B0000",
                    color: "#ffffff"
                  }}
                  className="w-full text-left py-4 px-6 border border-[#3B1E1E] bg-[#121010]/80 backdrop-blur-md rounded-sm text-xs font-bold tracking-[0.25em] text-[#A09888] transition-all duration-300"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
