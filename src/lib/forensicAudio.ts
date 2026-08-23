class ForensicAudioManager {
  private static instance: ForensicAudioManager;
  private ctx: AudioContext | null = null;

  private constructor() {}

  public static getInstance(): ForensicAudioManager {
    if (!ForensicAudioManager.instance) {
      ForensicAudioManager.instance = new ForensicAudioManager();
    }
    return ForensicAudioManager.instance;
  }

  public initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /* ── 1. Cardboard Folder Heavy Crease & Fiber Thud ── */
  public playFolderOpen() {
    this.initContext();
    if (!this.ctx) return;

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
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.38);

    this.playFrictionNoise(0.25, 300, 0.18);
  }

  /* ── 2. Evidence Seal Paper Tear & Adhesive Snap ── */
  public playAdhesiveSnap() {
    this.initContext();
    if (!this.ctx) return;

    this.playFrictionNoise(0.18, 2200, 0.3);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800 + Math.random() * 100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  /* ── 3. Spring-Loaded Mechanical Dictaphone Button Clunk ── */
  public playDictaphoneSwitch(state: "play" | "stop") {
    this.initContext();
    if (!this.ctx) return;

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
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.14);
    osc2.stop(this.ctx.currentTime + 0.14);
  }

  /* ── 4. Fountain Pen Nib Friction / Menu Hover ── */
  public playPenFriction() {
    this.initContext();
    this.playFrictionNoise(0.06, 3200 + Math.random() * 400, 0.05);
  }

  /* ── 5. Mechanical Rubber Stamp Impact ── */
  public playStampSlam() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);

    this.playFrictionNoise(0.1, 800, 0.25);
  }

  private playFrictionNoise(duration: number, freq: number, volume: number) {
    if (!this.ctx) return;
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
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  /* ── 6. UV Blacklight Torch Heavy Click & 60Hz Electrical Hum ── */
  public playUvSwitch(active: boolean) {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(active ? 1200 : 800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(active ? 1600 : 400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);

    this.playFrictionNoise(0.05, 4500, 0.2);
  }

  /* ── 7. Sticky Note Adhesive Peeling Noise ── */
  public playStickyPeel() {
    this.initContext();
    this.playFrictionNoise(0.12, 1800 + Math.random() * 300, 0.15);
  }

  /* ── 8. Carbon Copy Paper Sliding Friction ── */
  public playPaperSlide() {
    this.initContext();
    this.playFrictionNoise(0.15, 2400 + Math.random() * 400, 0.18);
  }

  /* ── 9. Solid Cardboard Photo Thud (Loupe Inspect / Set Down) ── */
  public playPhotoInspect() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);

    this.playFrictionNoise(0.08, 900, 0.2);
  }
}

export const forensicAudio = ForensicAudioManager.getInstance();
