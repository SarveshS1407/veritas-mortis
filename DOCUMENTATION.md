# VERITAS MORTIS — Complete Project Documentation
### A Procedurally Generated Detective-Horror Game
**Author:** S. Sarvesh  
**Date:** August 2026  
**Tech Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Howler.js · Pixi.js · Zustand · Claude 3.5 Sonnet API  
**Platform:** macOS (Apple Silicon M1)

---

## Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Day 1 — Foundation & Setup](#2-day-1--foundation--setup)
3. [Day 2 — 3-Act Thriller Engine & Micro-Forensics](#3-day-2--3-act-thriller-engine--micro-forensics)
4. [Day 3 — Diegetic Onboarding HUD & Detective Subtitle System](#4-day-3--diegetic-onboarding-hud--detective-subtitle-system)
5. [Key Concepts Explained](#5-key-concepts-explained)

---

## 1. Project Overview & Architecture

### What Is Veritas Mortis?
"Veritas Mortis" (Latin: "The Truth of Death") is a procedurally generated neo-noir detective-horror deduction game. Inspired by Agatha Christie and David Fincher, each case generates a logically airtight homicide with layered deceptions, 3-act narrative reversals, and deep micro-forensics.

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Next.js  │  │ Zustand  │  │ Howler.js / Web    │    │
│  │ React 19 │◄─│ Case     │──│ Audio Synthesizer  │    │
│  │   UI     │  │ Store    │  │     Engine         │    │
│  └────┬─────┘  └──────────┘  └────────────────────┘    │
│       │                                                  │
│       │ API Routes                                       │
│ ├─────┼──────────────────────────────────────────────────┤
│ │     ▼                                                  │
│ │┌─────────────────────────────────────────────┐        │
│ ││          Next.js API Routes (Server)         │        │
│ ││  /api/generate-case   → Procedural PRNG/LLM │        │
│ ││  /api/interrogate     → Suspect Psychology  │        │
│ ││  /api/verify-indictment → Verdict Evaluation│        │
│ ││  /api/save-progress   → Session Persistence │        │
│ │└──────────────┬──────────────────────────────┘        │
│ │               │                                        │
│ │               ▼                                        │
│ │┌──────────────────────────┐                           │
│ ││   Claude 3.5 Sonnet API  │                           │
│ ││   (Procedural Fallback)  │                           │
│ │└──────────────────────────┘                           │
│ └────────────────────────────────────────────────────────┘
```

---

## 2. Day 1 — Foundation & Setup
- Project initialization with Next.js 16 App Router & Tailwind CSS 4 `@theme inline`.
- Custom color tokens: `pitch` (`#050505`), `parchment` (`#D4C5A9`), `crimson` (`#6B0000`), `bone` (`#E8E3D9`).
- Layered 3D Detective Desk, procedural blood shaders, and sound synthesis.

---

## 3. Day 2 — 3-Act Thriller Engine & Micro-Forensics

### 3.1 3-Act Narrative Reversal Architecture
1. **Act 1 (The Hook / Frame-up)**: Initial crime scene discovery where circumstantial evidence and public disputes point toward a framed red herring.
2. **Act 2 (The Reversal)**: Toxicology blood chromatography, wiretapped audio transcripts, and timestamp logs shatter the initial theory and exonerate the red herring.
3. **Act 3 (The Climax)**: Forensic UV blacklight inspection and chemical/ballistic smoking-gun proof corner the true culprit into a dramatic breakdown.

### 3.2 Micro-Forensics Matrix
- **Victim Profile**: Pathologist autopsy sheet, primary injury analysis, gastric contents, defensive wound verification, and toxicology serum anomalies.
- **Evidence Classifications**: `PHYSICAL`, `DOCUMENT`, `BIO`, `AUDIO`, and `UV_HIDDEN` (365nm blacklight revealing latent fingerprints and poison halos).
- **Suspect Psychology Matrix**: 4 Composure Tiers (`CALM` $\to$ `DEFLECTING` $\to$ `CORNERED` $\to$ `BROKEN`) with dynamic stress levels (0–100) and fatal contradiction triggers.

---

## 4. Day 3 — Diegetic Onboarding HUD & Detective Subtitle System

### 4.1 Atmospheric Typewriter HUD
- Vintage 1970s Homicide Precinct Dispatch theme (`#1C1814` walnut docket cardstock, `#5C4A38` weathered borders, `#C89B3C` amber dispatch indicators).
- Letter-by-letter monospace typewriter animation with synthesized mechanical clicks (`forensicAudio.playTypewriterKey()`) and radio-static chimes.

### 4.2 Reactive Action-Gated Progression
Instead of arbitrary timers, the subtitle HUD strictly waits for player interaction:
- **Step 1**: Awaiting protocol acknowledgement (<kbd>SPACE</kbd> / Click).
- **Step 2**: Awaiting evidence inspection on the corkboard (`activeEvidenceId`).
- **Step 3**: Awaiting yarn thread link or suspect selection (`redStrings` / `activeSuspectId`).
- **Step 4**: Awaiting interrogation action or forensic tool toggle (`interrogationLog` / `activeForensicTool`).
- **Persistent Objective**: Minimizes into an active directive tag tracking case progress.

---

## 5. Key Concepts Explained
- **Mulberry32 PRNG**: Deterministic 32-bit pseudo-random number generator ensuring 100% reproducible mystery seeds.
- **Stateful Composure Machine**: Mathematical stress mapping ($0 \to 100$) governing suspect speech patterns and confession triggers.
