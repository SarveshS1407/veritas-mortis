class ForensicAudioManager {
  private static instance: ForensicAudioManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private isAmbientPlaying = false;
  private volume = 0.7;
  private muted = false;

  private constructor() {}

  public static getInstance(): ForensicAudioManager {
    if (!ForensicAudioManager.instance) {
      ForensicAudioManager.instance = new ForensicAudioManager();
    }
    return ForensicAudioManager.instance;
  }

  public initContext() {
    if (typeof window === "undefined") return;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  private getDestination(): AudioNode | null {
    this.initContext();
    if (!this.ctx || !this.masterGain) return null;
    return this.masterGain;
  }

  public setMasterVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (muted && this.isAmbientPlaying) {
      this.stopAmbientDrone();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /* ── Ambient Noir Drone (Low Frequency Sub-Tension) ── */
  public startAmbientDrone() {
    if (this.isAmbientPlaying || this.muted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 3.0);

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = "lowpass";
      this.ambientFilter.frequency.setValueAtTime(95, this.ctx.currentTime);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = "sine";
      this.ambientOsc1.frequency.setValueAtTime(46.25, this.ctx.currentTime); // Low F#

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = "triangle";
      this.ambientOsc2.frequency.setValueAtTime(48.5, this.ctx.currentTime); // Detuned rumble

      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch {
      // Audio playback restrictions handled gracefully
    }
  }

  public stopAmbientDrone() {
    if (!this.isAmbientPlaying || !this.ctx) return;
    try {
      if (this.ambientGain) {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
      }
      setTimeout(() => {
        try {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
          this.ambientOsc1?.disconnect();
          this.ambientOsc2?.disconnect();
          this.ambientFilter?.disconnect();
          this.ambientGain?.disconnect();
        } catch {}
        this.isAmbientPlaying = false;
      }, 1000);
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  /* ── 1. Cardboard Folder Heavy Crease & Fiber Thud ── */
  public playFolderOpen() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    const pitchDetune = 55 + (Math.random() * 8 - 4);
    osc.frequency.setValueAtTime(pitchDetune, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.38);

    this.playFrictionNoise(0.25, 300, 0.18);
  }

  /* ── 2. Evidence Seal Paper Tear & Adhesive Snap ── */
  public playAdhesiveSnap() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    this.playFrictionNoise(0.18, 2200, 0.3);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800 + Math.random() * 100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  /* ── 3. Spring-Loaded Mechanical Dictaphone Button Clunk ── */
  public playDictaphoneSwitch(state: "play" | "stop") {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";

    const baseFreq = state === "play" ? 180 : 140;
    osc1.frequency.setValueAtTime(baseFreq + Math.random() * 15, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

    osc2.frequency.setValueAtTime(baseFreq * 2.2, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.14);
    osc2.stop(this.ctx.currentTime + 0.14);
  }

  /* ── 4. Fountain Pen Nib Friction / Menu Hover ── */
  public playPenFriction() {
    this.playFrictionNoise(0.06, 3200 + Math.random() * 400, 0.05);
  }

  /* ── 5. Mechanical Rubber Stamp Impact ── */
  public playStampSlam() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);

    this.playFrictionNoise(0.1, 800, 0.25);
  }

  private playFrictionNoise(duration: number, freq: number, volume: number) {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    if (bufferSize <= 0) return;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
  }

  /* ── 6. UV Blacklight Torch Heavy Click & 60Hz Electrical Hum ── */
  public playUvSwitch(active: boolean) {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(active ? 1200 : 800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(active ? 1600 : 400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);

    this.playFrictionNoise(0.05, 4500, 0.2);
  }

  /* ── 7. Sticky Note Adhesive Peeling Noise ── */
  public playStickyPeel() {
    this.playFrictionNoise(0.12, 1800 + Math.random() * 300, 0.15);
  }

  /* ── 8. Carbon Copy Paper Sliding Friction ── */
  public playPaperSlide() {
    this.playFrictionNoise(0.15, 2400 + Math.random() * 400, 0.18);
  }

  /* ── 9. Solid Cardboard Photo Thud (Loupe Inspect / Set Down) ── */
  public playPhotoInspect() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);

    this.playFrictionNoise(0.08, 900, 0.2);
  }

  /* ── 10. Typewriter Mechanical Keystroke Click & Slap ── */
  public playTypewriterKey() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    const baseFreq = 700 + Math.random() * 350;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);

    this.playFrictionNoise(0.025, 4200 + Math.random() * 800, 0.08);
  }

  /* ── 11. Objective / Radio-Static Chime ── */
  public playRadioChime() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25); // A5

    osc2.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.25); // E5

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.45);
    osc2.stop(this.ctx.currentTime + 0.45);

    this.playFrictionNoise(0.08, 1200, 0.06);
  }

  /* ── 12. Red String Connection Pluck (Acoustic Tension String) ── */
  public playStringPluck() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220 + Math.random() * 80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  /* ── 13. Deep Heartbeat Pulse (Suspect Cornered) ── */
  public playHeartbeat() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    // Lub
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(65, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(dest);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Dub
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(55, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(28, now + 0.35);
    gain2.gain.setValueAtTime(0.3, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.38);
  }

  /* ── 14. Dramatic Reversal Impact (Act 2 Reversal / Climax) ── */
  public playReversalImpact() {
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Sub Bass Boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now);
    subOsc.stop(now + 1.4);

    // Metallic shimmer
    this.playFrictionNoise(0.8, 1800, 0.35);
  }
}

export const forensicAudio = ForensicAudioManager.getInstance();
