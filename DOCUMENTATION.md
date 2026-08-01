# VERITAS MORTIS — Complete Project Documentation
### A Procedurally Generated Detective-Horror Game
**Author:** [Your Name]  
**Date Started:** August 1, 2026  
**Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · Framer Motion · Howler.js · Pixi.js · Zustand · Claude 3.5 Sonnet API  
**Platform:** macOS (Apple Silicon M1)

---

## Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Day 1 — Foundation & Setup](#2-day-1--foundation--setup)
   - [2.1 Project Initialization](#21-project-initialization)
   - [2.2 Design System — Color Palette & Tokens](#22-design-system--color-palette--tokens)
   - [2.3 Typography — Font Selection & Loading](#23-typography--font-selection--loading)
   - [2.4 Dependencies — What & Why](#24-dependencies--what--why)
   - [2.5 Title Screen — Layout & Animation Layers](#25-title-screen--layout--animation-layers)
   - [2.6 Blood Splatter System — Procedural Canvas Animation](#26-blood-splatter-system--procedural-canvas-animation)
   - [2.7 Sound Synthesis — Web Audio API](#27-sound-synthesis--web-audio-api)
3. [Key Concepts Explained](#3-key-concepts-explained)

---

## 1. Project Overview & Architecture

### What Is Veritas Mortis?
"Veritas Mortis" (Latin: "The Truth of Death") is a procedurally generated detective-horror game that runs in the browser. Each new game uses an LLM (Large Language Model) to generate a unique murder mystery with suspects, evidence, alibis, and branching endings.

### Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Next.js  │  │ Zustand  │  │ Howler.js / Canvas │    │
│  │  React   │◄─│  State   │──│   Audio / Visual   │    │
│  │   UI     │  │  Store   │  │      Engine         │    │
│  └────┬─────┘  └──────────┘  └────────────────────┘    │
│       │                                                  │
│       │ API Routes                                       │
├───────┼──────────────────────────────────────────────────┤
│       ▼                                                  │
│  ┌─────────────────────────────────────────────┐        │
│  │          Next.js API Routes (Server)         │        │
│  │  /api/generate-case   → LLM Case Generation │        │
│  │  /api/interrogate     → LLM Suspect Roleplay│        │
│  └──────────────┬──────────────────────────────┘        │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────┐                           │
│  │   Claude 3.5 Sonnet API  │                           │
│  │   (or Ollama local LLM)  │                           │
│  └──────────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

### Folder Structure (as of Day 1)

```
veritas-mortis/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css         # Global styles & design tokens
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   └── page.tsx            # Title screen (home page)
│   ├── components/
│   │   └── ui/
│   │       └── BloodCanvas.tsx # Animated blood splatter system
│   └── lib/
│       └── utils.ts            # Utility functions (cn helper)
├── public/
│   └── textures/               # Image assets (smoke, blood)
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS (used by Tailwind)
└── next.config.ts              # Next.js configuration
```

### Why Next.js?
Next.js was chosen because:
- **App Router** provides file-based routing (each folder in `src/app/` becomes a URL route)
- **API Routes** let us create server-side endpoints (for calling the Claude API) without a separate backend
- **Server Components** by default, with `"use client"` directive for interactive components
- **Turbopack** bundler is extremely fast on M1 Macs (~188ms cold start)

---

## 2. Day 1 — Foundation & Setup

### 2.1 Project Initialization

**Command used:**
```bash
npx -y create-next-app@latest veritas-mortis --typescript --tailwind --app --eslint --src-dir --use-npm --yes
```

**Flag breakdown:**

| Flag | Purpose |
|------|---------|
| `--typescript` | Enables TypeScript for type safety |
| `--tailwind` | Pre-configures Tailwind CSS |
| `--app` | Uses the App Router (not the older Pages Router) |
| `--eslint` | Adds ESLint for code quality checking |
| `--src-dir` | Puts source code inside `src/` instead of root |
| `--use-npm` | Uses npm as package manager (later switched to pnpm) |
| `--yes` | Accepts all defaults without interactive prompts |

**What this generates:**
- A complete Next.js project with TypeScript configured
- Tailwind CSS 4 with PostCSS integration
- A `.git` repository initialized with an initial commit
- Development server accessible at `http://localhost:3000`

**Migration to pnpm:**
We later switched from npm to pnpm for faster installs and better disk efficiency:
```bash
rm -rf node_modules package-lock.json
pnpm install
```

---

### 2.2 Design System — Color Palette & Tokens

**File:** `src/app/globals.css`

The visual aesthetic is called **"Macabre Realism" / "Analog Gothic"** — dark leather, aged parchment, oxidized blood.

**How Tailwind CSS 4 theming works:**

In Tailwind CSS 4, you define custom colors inside a `@theme inline` block in your CSS file. This registers them as both CSS variables AND Tailwind utility classes.

```css
@import "tailwindcss";

@theme inline {
  --color-pitch: #050505;      /* Near-black, main background */
  --color-leather: #121010;    /* Dark brown-black, panel surfaces */
  --color-charcoal: #1A1714;   /* Warm dark gray, card surfaces */
  --color-parchment: #D4C5A9;  /* Aged yellow paper */
  --color-bone: #E8E3D9;       /* Off-white, primary text color */
  --color-crimson: #6B0000;    /* Oxidized dark red, danger/blood */
  --color-blood: #8B0000;      /* Brighter blood red */
  --color-rust: #4A1A1A;       /* Muted dark red-brown */
  --color-ink: #2A2520;        /* Dark brownish, secondary text */
}
```

**What `@theme inline` does:**
- `--color-pitch: #050505` creates BOTH:
  - A CSS variable `var(--color-pitch)` usable in any CSS
  - Tailwind classes `bg-pitch`, `text-pitch`, `border-pitch`, etc.
- The `inline` keyword means these values are inlined directly (not referenced from a config file)

**Why these specific colors?**
- `#050505` (pitch) — Not pure `#000000` black. Pure black looks flat and digital. A near-black with a hint of warmth feels like darkness you could touch.
- `#D4C5A9` (parchment) — Matches aged paper from the 1940s-1960s. Forensic reports, case files, and witness statements would be on paper this color.
- `#6B0000` (crimson) — Oxidized blood darkens over time. Fresh blood is bright red; dried blood on evidence turns this shade.
- `#E8E3D9` (bone) — Human bone isn't pure white. This warm off-white is anatomically accurate and easier on the eyes than `#FFFFFF`.

**Custom scrollbar and selection styles:**
```css
/* Text selection turns blood red */
::selection {
  background-color: var(--color-crimson);
  color: var(--color-bone);
}

/* Thin, dark scrollbar matching the aesthetic */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--color-pitch); }
::-webkit-scrollbar-thumb { background: var(--color-rust); border-radius: 3px; }
```

---

### 2.3 Typography — Font Selection & Loading

**File:** `src/app/layout.tsx`

**Fonts chosen:**

| Font | Type | Usage | Why |
|------|------|-------|-----|
| Cinzel Decorative | Serif display | Game title, chapter headings, suspect names | Resembles Roman inscriptions carved in stone — fits the Latin name "Veritas Mortis" |
| IBM Plex Mono | Monospace | Forensic data, timestamps, evidence IDs, terminal-style text | Designed by IBM for technical readability — feels like police database output |

**How Next.js font loading works:**

```tsx
import { Cinzel_Decorative, IBM_Plex_Mono } from "next/font/google";

const titleFont = Cinzel_Decorative({
  variable: "--font-title",     // Creates a CSS variable
  subsets: ["latin"],           // Only load Latin characters (smaller download)
  weight: ["400", "700", "900"], // Normal, bold, black weights
});
```

**What `variable: "--font-title"` does:**
1. Next.js downloads the font at build time (not from Google's CDN at runtime)
2. Creates a CSS variable `--font-title` containing the font-family string
3. Applies it via a class on the `<html>` element
4. In `globals.css`, we reference it: `--font-serif: var(--font-title), Georgia, serif;`

**The fallback chain:** `var(--font-title), Georgia, serif` means:
- First try Cinzel Decorative (our custom font)
- If it hasn't loaded yet, use Georgia (a serif font available on all systems)
- Last resort: any serif font the browser has

**Root Layout structure:**
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${titleFont.variable} ${ibmMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-pitch text-bone">
        {children}   {/* ← Every page renders here */}
      </body>
    </html>
  );
}
```

**Key detail:** `antialiased` enables font smoothing on macOS, making text render with smoother edges.

---

### 2.4 Dependencies — What & Why

**Command:**
```bash
pnpm add framer-motion clsx tailwind-merge lucide-react zustand howler pixi.js @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities sonner
pnpm add -D @types/howler
```

| Package | Category | Purpose in This Game |
|---------|----------|---------------------|
| `framer-motion` | Animation | Page transitions, shaking panic text, paper physics, evidence reveal effects |
| `clsx` | Utility | Conditionally join CSS class names: `clsx("base", isActive && "active")` |
| `tailwind-merge` | Utility | Resolves Tailwind class conflicts: `twMerge("text-red", "text-blue")` → `"text-blue"` |
| `lucide-react` | Icons | SVG icon library — skull, eye, fingerprint, file, lock, clock |
| `zustand` | State | Lightweight state management — tracks game state (acts, suspects, sanity, evidence) |
| `howler` | Audio | Multi-channel audio engine — ambient drones, heartbeat, stingers |
| `@types/howler` | Types | TypeScript type definitions for Howler.js (dev dependency) |
| `pixi.js` | Canvas | WebGL rendering — blood borders, floor plan, luminol glow effects |
| `@dnd-kit/core` | Interaction | Drag-and-drop engine — dragging evidence, suspect tokens |
| `@dnd-kit/sortable` | Interaction | Sortable lists — reordering evidence cards, dossier stacks |
| `sonner` | UI | Toast notifications — "New evidence discovered", act transitions |

**The `cn()` utility function:**

**File:** `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**What this does and why it matters:**

Without `cn()`:
```tsx
// Problem: "text-bone" and "text-crimson" conflict — which one wins?
<p className={`text-bone ${isEvidence ? "text-crimson" : ""}`}>
```

With `cn()`:
```tsx
// Solution: tailwind-merge intelligently resolves the conflict
<p className={cn("text-bone", isEvidence && "text-crimson")}>
// If isEvidence=true → "text-crimson" (conflict resolved, last wins)
// If isEvidence=false → "text-bone"
```

---

### 2.5 Title Screen — Layout & Animation Layers

**File:** `src/app/page.tsx`

The title screen is built as a **layered composition** — 6 visual layers stacked on top of each other using `position: absolute`. Think of it like Photoshop layers:

```
Layer 6 (top):  Center content (title, button)         z-10
Layer 5:        Top & bottom darkness gradients         ─
Layer 4:        Heavy vignette (radial gradient)        ─
Layer 3:        Screen flash (white, barely visible)    ─
Layer 2:        Smoke texture (drifting right)           ─
Layer 1:        Smoke texture (drifting left)            ─
Layer 0 (base): Blood splatter canvas                   z-20
Container:      Pitch black background + light flicker  ─
```

**Key CSS concept — `pointer-events-none`:**
Every overlay layer has `pointer-events-none` so mouse clicks pass through them to the button underneath. Without this, the invisible layers would block all interaction.

**Key CSS concept — `mix-blend-mode: screen`:**
```css
mix-blend-mode: screen;
```
This blending mode makes **black pixels transparent** and only shows bright pixels. Since our smoke and blood textures are on black backgrounds, `screen` mode perfectly composites them over our dark background without a visible rectangle.

**Animation keyframes explained:**

```css
@keyframes light-flicker {
  0%, 100% { opacity: 1; filter: brightness(1); }
  41% { opacity: 0.6; filter: brightness(0.6); }
  41.5% { opacity: 0.9; filter: brightness(0.9); }
  42% { opacity: 1; filter: brightness(1.05); }
}
```

This is applied to the **entire page container**, so the whole screen dims and brightens. The percentages create an irregular pattern:
- 0–40%: Normal brightness (stable)
- 41%: Sudden drop to 60% (light flickers off)
- 41.5%: Partial recovery (light trying to come back)
- 42%: Full brightness + slight overexposure (power surge)
- This simulates a failing fluorescent light in a crime scene room

---

### 2.6 Blood Splatter System — Procedural Canvas Animation

**File:** `src/components/ui/BloodCanvas.tsx`

This is a **React client component** (marked with `"use client"`) that uses the HTML5 Canvas API to procedurally draw blood splatters that appear one-by-one with timed delays.

**Why `"use client"`?**
Next.js 16 components are **Server Components** by default — they render on the server and send HTML to the browser. But canvas drawing and audio playback require browser APIs (`document`, `window`, `AudioContext`), so we must explicitly mark this as a client component.

**The Canvas API — how drawing works:**

```tsx
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");  // Get 2D drawing context

// Set canvas size to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
```

The canvas is a bitmap drawing surface. We get a "context" (`ctx`) that provides methods like:
- `ctx.beginPath()` — Start a new shape
- `ctx.arc(x, y, radius, 0, Math.PI * 2)` — Draw a circle
- `ctx.quadraticCurveTo(cpX, cpY, endX, endY)` — Draw a curved line
- `ctx.fill()` — Fill the current shape
- `ctx.stroke()` — Draw the outline of the current shape

**How each splatter is drawn (3 parts):**

**Part 1 — Main blob (irregular shape):**
```tsx
const points = 8 + Math.floor(Math.random() * 5);  // 8-12 points
for (let i = 0; i < points; i++) {
  const angle = (i / points) * Math.PI * 2;         // Evenly spaced around a circle
  const radius = size * (0.4 + Math.random() * 0.6); // Random radius per point
  // Connect points with curved lines (quadraticCurveTo)
}
```
This creates an organic, irregular blob shape — not a perfect circle. Each point sits at a different distance from the center, and curved lines connect them.

**Part 2 — Radiating streaks:**
```tsx
for (let i = 0; i < 6 + Math.floor(Math.random() * 6); i++) {
  const angle = Math.random() * Math.PI * 2;     // Random direction
  const length = size * (0.8 + Math.random() * 1.5); // Random length
  // Draw a line from center outward
  // Add a small droplet at the end
}
```
These simulate the spray pattern when blood hits a surface at velocity.

**Part 3 — Downward drip:**
A curved line extending downward from the blob, ending in a teardrop shape — simulates blood running down a vertical surface under gravity.

**Staggered timing:**
```tsx
const SPLATTERS = [
  { x: 0.12, y: 0.25, size: 70, delay: 1500 },  // Appears at 1.5s
  { x: 0.78, y: 0.15, size: 55, delay: 3200 },  // Appears at 3.2s
  // ...
];

SPLATTERS.forEach((splat) => {
  setTimeout(() => {
    drawSplatter(ctx, splat.x * canvas.width, splat.y * canvas.height, splat.size);
    playSplatterSound();
  }, splat.delay);
});
```

Each splatter uses `setTimeout` with a different delay, creating a sequence where blood appears one impact at a time, each with its own jarring sound.

---

### 2.7 Sound Synthesis — Web Audio API

**Inside:** `src/components/ui/BloodCanvas.tsx` (the `playSplatterSound` function)

Instead of loading an audio file, we **synthesize** a wet impact sound using the browser's Web Audio API. This is more flexible and requires zero external files.

**How it works — signal chain:**

```
Noise Generator → Low-Pass Filter → Volume Envelope → Speakers
     (burst)         (muffles it)     (fast decay)
```

**Step 1 — Generate noise burst:**
```tsx
const bufferSize = ctx.sampleRate * 0.15;  // 150ms of audio
const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
const data = noiseBuffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
  data[i] = (Math.random() * 2 - 1)          // Random value between -1 and 1
           * Math.pow(1 - i / bufferSize, 3); // Decay: loud at start, quiet at end
}
```
This creates 150 milliseconds of white noise that rapidly decays — the raw "impact" sound.

**Step 2 — Low-pass filter (makes it "wet"):**
```tsx
const filter = ctx.createBiquadFilter();
filter.type = "lowpass";
filter.frequency.setValueAtTime(800, now);     // Start at 800 Hz
filter.frequency.exponentialRampToValueAtTime(200, now + 0.15); // Drop to 200 Hz
```
A low-pass filter removes high frequencies. Starting at 800Hz and dropping to 200Hz over 150ms creates that muffled, visceral "thud" quality — it sounds wet rather than crispy.

**Step 3 — Volume envelope:**
```tsx
const gainNode = ctx.createGain();
gainNode.gain.setValueAtTime(0.4, now);          // Start at 40% volume
gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2); // Fade to 1% over 200ms
```
The volume starts moderate and fades quickly — a sharp transient impact, not a sustained sound.

---

## 3. Key Concepts Explained

### React Server Components vs Client Components

| Feature | Server Component (default) | Client Component (`"use client"`) |
|---------|---------------------------|-----------------------------------|
| Renders on | Server | Browser |
| Can use `useState`, `useEffect` | ❌ No | ✅ Yes |
| Can access browser APIs (DOM, Canvas, Audio) | ❌ No | ✅ Yes |
| Can access server resources (DB, filesystem) | ✅ Yes | ❌ No |
| Shipped to browser as | HTML | JavaScript |

**Rule of thumb:** If a component needs interactivity, animation, or browser APIs → `"use client"`. If it just displays data → keep it as a Server Component (the default).

### Tailwind CSS 4 vs Tailwind CSS 3

| Feature | Tailwind 3 | Tailwind 4 (what we use) |
|---------|-----------|-----------|
| Config file | `tailwind.config.js` | `@theme` block in CSS |
| Custom colors | In config file | `--color-name` in `@theme inline` |
| PostCSS | Required | Required |
| Classes | Same | Same (`bg-red-500`, etc.) |

### The `@/*` Import Alias

In `tsconfig.json`:
```json
"paths": { "@/*": ["./src/*"] }
```

This means `@/components/ui/BloodCanvas` resolves to `src/components/ui/BloodCanvas`. Avoids ugly relative paths like `../../../components/ui/BloodCanvas`.

### CSS `position: absolute` + `inset-0` Pattern

```tsx
<div className="absolute inset-0">
```

This is equivalent to:
```css
position: absolute;
top: 0; right: 0; bottom: 0; left: 0;
```

It stretches the element to fill its nearest positioned parent (`relative`, `absolute`, or `fixed`). We use this for every overlay layer — vignette, fog, blood canvas — so they all cover the full screen.

---

> **This document will be updated with each new development session.**
> 
> Next sections to be added:
> - Day 2: Audio Engine & Canvas Effects
> - Day 3: State Management & Game Logic
> - Day 4: Investigation UI Components
> - Day 5: Interrogation Engine
> - Day 6: LLM Integration
> - Day 7: Polish & Production
