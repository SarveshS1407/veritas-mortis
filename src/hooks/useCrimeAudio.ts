"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Howl, Howler } from "howler";

export interface CrimeAudioState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  duration: number;
}

/**
 * Universal Crime Audio Hook for Veritas Mortis.
 * Authentic, pure realistic horror recording (zero artificial footsteps):
 * - 0.0s – 2.0s: Menacing dread drone, tape hiss, panicked breathing & heartbeat
 * - 3.05s: Sudden loud, brutal BONE FRACTURE SNAP #1 + blade slash & piercing scream
 * - 5.8s: Second sickening BONE CRACK #2 & agonized shriek
 * - 8.4s: Third fatal BONE BREAK #3 & death struggle
 * - 11.0s – 12.8s: Agonal gasps & authentic tape cutoff
 */
export function useCrimeAudio() {
  const [state, setState] = useState<CrimeAudioState>({
    isPlaying: false,
    isLoading: false,
    hasError: false,
    errorMessage: null,
    duration: 12.8,
  });

  const soundsRef = useRef<{
    masterTape?: Howl;
    demonicScream?: Howl;
    uvbScream?: Howl;
    ghostVoices?: Howl;
    knifeStab?: Howl;
    swordSlash?: Howl;
  }>({});

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  /**
   * Explicitly unlock and resume the Web Audio / Howler context.
   * Handles modern Chromium & Electron autoplay policies.
   */
  const resumeAudioContext = useCallback(async () => {
    try {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        await Howler.ctx.resume();
        console.info("[CrimeAudio] Howler.ctx successfully resumed.");
      }
    } catch (err) {
      console.warn("[CrimeAudio] Could not resume Howler.ctx:", err);
    }
  }, []);

  /**
   * Initialize all authentic open-source recordings.
   */
  const initSounds = useCallback(() => {
    if (soundsRef.current.masterTape) return;

    soundsRef.current = {
      // 1. Master Evidence Tape (Pure realistic bone snaps, screams, heartbeat, dread drone)
      masterTape: new Howl({
        src: ["/audio/evidence-murder-tape.wav", "/audio/evidence-murder-tape.mp3"],
        html5: true,
        volume: 1.0,
        onend: () => {
          console.info("[CrimeAudio] Master evidence tape completed.");
          stop();
        },
      }),

      // 2. Real Demonic Screech
      demonicScream: new Howl({
        src: ["/audio/real/demonic-scream.mp3"],
        volume: 1.0,
      }),

      // 3. Real UVB Terror Woman Scream
      uvbScream: new Howl({
        src: ["/audio/real/uvb-woman-scream.ogg"],
        volume: 1.0,
      }),

      // 4. Ghostly Disembodied Voices
      ghostVoices: new Howl({
        src: ["/audio/real/ghost-voices.oga"],
        volume: 0.7,
        loop: true,
      }),

      // 5. Real Knife / Dagger Stab Impact
      knifeStab: new Howl({
        src: ["/audio/real/knife-stab.mp3"],
        volume: 1.0,
      }),

      // 6. Real Blade Slash
      swordSlash: new Howl({
        src: ["/audio/real/sword-slash-1.mp3"],
        volume: 1.0,
      }),
    };
  }, []);

  /**
   * Stop all playing tracks cleanly.
   */
  const stop = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    const s = soundsRef.current;
    if (s) {
      s.masterTape?.stop();
      s.demonicScream?.stop();
      s.uvbScream?.stop();
      s.ghostVoices?.stop();
      s.knifeStab?.stop();
      s.swordSlash?.stop();
    }

    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  /**
   * Play the pure realistic horror crime scene tape.
   */
  const play = useCallback(async () => {
    await resumeAudioContext();
    initSounds();

    const s = soundsRef.current;
    if (!s) return;

    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    // ── Phase 1 (0.0s): Dread Drone, Heartbeat & Ghostly Voices ──
    s.masterTape?.play();
    s.ghostVoices?.play();

    // ── Phase 2 (3.05s): BONE CRACK #1 + Blade Slash + Demonic Scream ──
    const strike1 = setTimeout(() => {
      s.swordSlash?.play();
      s.knifeStab?.play();
      s.demonicScream?.play();
      s.uvbScream?.play();
    }, 3050);
    timeoutsRef.current.push(strike1);

    // ── Phase 3 (5.8s): BONE CRACK #2 + Agonized Shriek ──
    const strike2 = setTimeout(() => {
      s.knifeStab?.play();
      s.demonicScream?.rate(0.9);
      s.demonicScream?.play();
    }, 5800);
    timeoutsRef.current.push(strike2);

    // ── Phase 4 (8.4s): BONE CRACK #3 + Fatal Struggle ──
    const strike3 = setTimeout(() => {
      s.knifeStab?.play();
      s.swordSlash?.rate(1.1);
      s.swordSlash?.play();
    }, 8400);
    timeoutsRef.current.push(strike3);

    // ── Phase 5 (12.8s): Auto-stop at conclusion ──
    const endTimeout = setTimeout(() => {
      stop();
    }, 12800);
    timeoutsRef.current.push(endTimeout);

    setState({
      isPlaying: true,
      isLoading: false,
      hasError: false,
      errorMessage: null,
      duration: 12.8,
    });
  }, [initSounds, resumeAudioContext, stop]);

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      const s = soundsRef.current;
      if (s) {
        s.masterTape?.unload();
        s.demonicScream?.unload();
        s.uvbScream?.unload();
        s.ghostVoices?.unload();
        s.knifeStab?.unload();
        s.swordSlash?.unload();
      }
    };
  }, []);

  return {
    ...state,
    play,
    stop,
    pause,
    resumeAudioContext,
  };
}
