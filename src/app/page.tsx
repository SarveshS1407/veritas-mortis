"use client";

import { useState } from "react";
import CaseFileOpeningSequence from "@/components/ui/CaseFileOpeningSequence";
import InvestigationWorkspace from "@/components/ui/gameplay/InvestigationWorkspace";
import { useCaseStore } from "@/lib/useCaseStore";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const generateNewCase = useCaseStore((s) => s.generateNewCase);

  return (
    <main className="min-h-screen bg-black text-[#E8E3D9] overflow-hidden">
      {gameStarted ? (
        <InvestigationWorkspace onBackToMenu={() => setGameStarted(false)} />
      ) : (
        <CaseFileOpeningSequence
          onBeginInvestigation={() => {
            generateNewCase();
            setGameStarted(true);
          }}
        />
      )}
    </main>
  );
}