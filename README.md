# 🩸 VERITAS MORTIS

> *A procedurally generated, 1970s neo-noir psychological detective thriller.*

**Veritas Mortis** ("The Truth of Death") is a deterministic crime thriller engine and forensic investigation workspace built with Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, and Web Audio API. Inspired by Agatha Christie and David Fincher, it puts players in the shoes of a lead investigator unravelling airtight homicide cases through micro-forensics, dynamic alibi destructions, and high-pressure interrogations.

---

## 🗄️ Core Engine & Gameplay Systems

### 1. 🔍 3-Act Procedural Thriller Engine (`proceduralGenerator.ts`)
- **Deterministic Seeded PRNG**: Every case is uniquely reproducible by its numeric seed (e.g. `#VM-104820`) via a Mulberry32 algorithm.
- **Act 1 (The Hook)**: Initial crime scene discovery where circumstantial evidence points directly toward a framed red herring suspect.
- **Act 2 (The Reversal)**: Autopsy toxicology chromatography, wiretapped telephony transcripts, and timestamp logs shatter the initial theory and exonerate the red herring.
- **Act 3 (The Climax)**: Forensic UV blacklight inspection and chemical/ballistic smoking-gun proof corner the true culprit into an unvarnished confession.

### 2. 📋 Micro-Forensics Suite & Evidence Board
- **Autopsy Sheets**: Primary injuries, gastric contents, defensive wound analysis, and narrow estimated time-of-death windows.
- **Toxicology Chromatography**: Serum anomaly reports, metabolic decomposition rates, and fatal compound detection.
- **UV 365nm Blacklight Inspection**: Reveal hidden luminescent fingerprints, wiped blood halos, and chemical markers invisible under normal lighting.
- **Deductive Yarn Matrix**: Drag crimson thread connections between clue pushpins and suspect cards to construct airtight indictments.

### 3. ⚖️ Suspect Psychology & Composure Breakdown (`/api/interrogate`)
- 4 Composure Tiers: `CALM` $\to$ `DEFLECTING` $\to$ `CORNERED` $\to$ `BROKEN`.
- Dynamic stress tracking (0–100) mapped to atmospheric body language cues and dramatic confession sequences.

### 4. 🕵️‍♂️ Diegetic Detective Onboarding HUD (`InvestigationDialogueGuide.tsx`)
- Vintage 1970s Homicide Precinct case dispatch memorandum box.
- Monospace typewriter animation with synthesized mechanical keystroke clicks (`forensicAudio.playTypewriterKey()`) and radio-static chimes.
- **Action-Gated Progression**: Strictly waits for player interactions (inspecting evidence $\to$ linking threads $\to$ interrogating suspects) before auto-advancing.
- Persistent `[ OBJECTIVE: ... ]` tracker updating across Acts 1, 2, and 3.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & React 19
- **State Management:** [Zustand](https://zustand.docs.pmnd.rs/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Audio Engine:** Web Audio API (`forensicAudio.ts`) & [Howler.js](https://howlerjs.com/)
- **AI Integration:** Claude 3.5 Sonnet / Vercel AI SDK (with deterministic procedural engine fallback)

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Start the local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to begin the investigation.

---

*“The truth does not fear the light. It fears only the investigator who looks.”*
