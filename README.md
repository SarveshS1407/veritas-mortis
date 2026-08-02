# 🩸 VERITAS MORTIS

> *A cinematic, forensic-thriller interactive web experience.*

**Veritas Mortis** is a highly experimental, front-end web application designed to blur the lines between a traditional website and a cinematic video game. Built with Next.js 15, Framer Motion, and HTML5 Canvas, it drops the user directly into a macabre detective's desk, complete with interactive dossiers, crime scene evidence, and procedural blood physics.

---

## 🗄️ Core Features & Architecture

### 1. 🎥 Cinematic Sequencing (Framer Motion)
The application relies heavily on orchestrated animation states rather than standard page routing. 
- **Glass Shatter & Vault Sequences:** Complex staggered animations that serve as dynamic entryways into the application.
- **The Detective's Desk:** A 3D-perspective, parallax-driven main menu where users interact with physical folders, polaroids, and case files.
- **Dossier Layouts:** Interactive case files built with vintage, typewriter-style typography (IBM Plex Mono/Special Elite) and parchment textures.

### 2. 🩸 Procedural Blood Physics (HTML5 Canvas)
To achieve a visceral, "macabre realism" aesthetic without relying on massive static video files, the project implements custom Canvas graphics:
- **Dynamic Dripping:** When the gunshot trigger occurs, an array of physics-based fluid particles spawns and drips down the screen in real-time.
- **Speckled Stains:** Organic splatter patterns are procedurally calculated based on heavy Gaussian density math, ensuring no two bloodstains look exactly identical.

### 3. ⚙️ Hardware-Accelerated SVG Rendering
To solve a notorious Chromium sub-pixel rendering bug (where dark red text anti-aliases into bright pink against light backgrounds), this project uses ultimate GPU overrides:
- **`feColorMatrix` Crushing:** A custom inline SVG filter completely strips green and blue color channels during rasterization, guaranteeing a pure, oxidized crimson (`#4A0000`).
- **GPU Isolation:** Text layers are explicitly isolated onto their own M1 rendering layers using `transform: translateZ(0)` and `isolation: isolate` to prevent background texture alpha-blending.

### 4. 🎧 Web Audio API Engine
A lightweight, custom audio engine manages the atmosphere without relying on heavy external libraries.
- **Ambient Drone:** A 48Hz and 52Hz detuned sine oscillator setup that generates a subtle, throbbing binaural tension loop in the background.
- **Triggered SFX:** Gunshots, folder slaps, page turns, and fluid splatters perfectly synchronized to the Framer Motion timelines.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Graphics:** HTML5 `<canvas>`, Inline SVG Filters (`feTurbulence`, `feColorMatrix`)
- **Package Manager:** `pnpm`

---

## 🚀 Getting Started

First, install the dependencies using `pnpm`:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

- `/src/app` - Next.js 15 App Router entry points and global CSS.
- `/src/components/ui` - The core cinematic UI components (`CaseFileOpeningSequence`, `DistressedBloodStamp`, `InteractiveDossierMenu`, etc.)
- `/public` - Static assets, crime scene textures, mugshots, and SVG icons.

---

*“Who is pulling the strings?”*
