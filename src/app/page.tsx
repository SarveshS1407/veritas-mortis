"use client";

import { useState } from "react";
import CaseFileOpeningSequence from "@/components/ui/CaseFileOpeningSequence";
import InvestigationWorkspace from "@/components/ui/gameplay/InvestigationWorkspace";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  if (gameStarted) {
    return <InvestigationWorkspace onBackToMenu={() => setGameStarted(false)} />;
  }

  return (
    <main className="min-h-screen bg-black text-[#E8E3D9] overflow-hidden">
      <CaseFileOpeningSequence
        onBeginInvestigation={() => setGameStarted(true)}
      />
    </main>
  );
}