import {
  CaseData,
  Victim,
  Suspect,
  EvidenceItem,
  TimelineEvent,
  ActPhase,
  EvidenceCategory,
  ComposureLevel,
} from "@/types/case";

// Mulberry32 PRNG
function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POOLS = {
  victimNames: ["Arthur Pendelton", "Elias Thorne", "Sylvia Vance", "Marcus Reed", "Julian Blackwood", "Victor Sterling", "Eleanor Vance", "Cornelius Vance"],
  occupations: ["Wealthy Industrialist", "Antiquities Dealer", "Investigative Journalist", "City Councilman", "Retired Judge", "Socialite"],
  causesOfDeath: ["Blunt force trauma to the cranium", "Asphyxiation via ligature", "Exsanguination via severed carotid", "Cyanide poisoning", "Gunshot wound to the chest"],
  locationsFound: ["The Study", "The Conservatory", "The Wine Cellar", "The Docks", "An Alleyway behind the precinct"],
  suspectNames: ["Desmond Sterling", "Victoria Blackwood", "Harrison Reed", "Isabella Vance", "Oliver Pendelton", "Sebastian Thorne", "Lydia Vance"],
  roles: ["Business Partner", "Scorned Lover", "Disinherited Heir", "Personal Secretary", "Rival", "Groundskeeper"],
  alibis: ["I was at the theater.", "I was reviewing ledgers alone in my office.", "I was asleep in the guest wing.", "I was playing cards at the club.", "I was taking a walk by the lake."],
  hiddenSecrets: ["Embezzling company funds.", "Having a secret affair with the victim.", "Blackmailed by the victim.", "Addicted to gambling.", "In deep debt to the mob."],
  motives: ["Inheritance money", "Revenge for a ruined career", "Covering up fraud", "Jealousy", "Self-defense gone wrong"],
  evidenceCategories: ["autopsy", "ballistics", "fingerprint", "toxicology", "document", "photograph", "weapon", "testimony", "fiber", "threat_letter"] as EvidenceCategory[],
};

function getRandom<T>(prng: () => number, array: T[]): T {
  return array[Math.floor(prng() * array.length)];
}

function getRandomPosition(prng: () => number) {
  return {
    x: Math.floor(prng() * 80) + 10,
    y: Math.floor(prng() * 80) + 10,
  };
}

export function generateCase(seed?: number): CaseData {
  const caseSeed = seed ?? Math.floor(Math.random() * 1000000);
  const prng = mulberry32(caseSeed);

  const victimName = getRandom(prng, POOLS.victimNames);
  const victimAge = 35 + Math.floor(prng() * 40);
  const causeOfDeath = getRandom(prng, POOLS.causesOfDeath);
  
  const victim: Victim = {
    id: "vic_01",
    name: victimName,
    age: victimAge,
    occupation: getRandom(prng, POOLS.occupations),
    causeOfDeath: causeOfDeath,
    timeOfDeath: "11:45 PM",
    locationFound: getRandom(prng, POOLS.locationsFound),
    autopsySummary: `The body of ${victimName} shows signs of ${causeOfDeath.toLowerCase()}. Lividity suggests the body was not moved.`,
  };

  const suspectCount = 3;
  const suspects: Suspect[] = [];
  const killerIndex = Math.floor(prng() * suspectCount);
  
  let availableNames = [...POOLS.suspectNames];
  
  for (let i = 0; i < suspectCount; i++) {
    const nameIndex = Math.floor(prng() * availableNames.length);
    const name = availableNames.splice(nameIndex, 1)[0];
    const isGuilty = i === killerIndex;
    
    suspects.push({
      id: `sus_${i + 1}`,
      name,
      age: 20 + Math.floor(prng() * 50),
      role: getRandom(prng, POOLS.roles),
      portraitDescription: `A tall figure in dark clothing, looking tense.`,
      alibi: getRandom(prng, POOLS.alibis),
      hiddenSecret: getRandom(prng, POOLS.hiddenSecrets),
      motive: getRandom(prng, POOLS.motives),
      contradictionEvidenceId: `ev_alibi_${i}`,
      composure: 100,
      composureLevel: "CALM",
      dialogueByComposure: {
        CALM: ["I have nothing to hide.", "Ask what you must, detective.", "I was nowhere near the scene."],
        DEFLECTING: ["Are you accusing me?", "That proves nothing.", "You're grasping at straws."],
        CORNERED: ["This is absurd!", "You can't prove that!", "I didn't mean for it to happen..."],
        BROKEN: ["Fine. You win.", "It was the only way.", "I had no choice."]
      },
      bodyLanguageCues: {
        CALM: "[Maintains steady eye contact, hands folded]",
        DEFLECTING: "[Shifts weight, crosses arms defensively]",
        CORNERED: "[Pupils dilate, rapid micro-tremors in left hand]",
        BROKEN: "[Slumps shoulders, avoids gaze entirely]"
      },
      isGuilty,
      relationships: [],
      boardPosition: getRandomPosition(prng),
      interrogationCount: 0
    });
  }

  const evidence: EvidenceItem[] = [];
  const actPhases: ActPhase[] = ["act1_hook", "act1_hook", "act1_hook", "act1_hook", "act2_reversal", "act2_reversal", "act2_reversal", "act3_climax"];
  const weaponEvId = "ev_weapon_1";
  
  for (let i = 0; i < 8; i++) {
    const evId = i === 0 ? weaponEvId : (i <= 3 ? `ev_alibi_${i - 1}` : `ev_gen_${i}`);
    const category = getRandom(prng, POOLS.evidenceCategories);
    const implicates = [suspects[Math.floor(prng() * suspects.length)].id];
    
    evidence.push({
      id: evId,
      title: `${category.toUpperCase()} ITEM #${i + 1}`,
      category,
      summary: `A suspicious ${category} found at the scene.`,
      fullAnalysis: `Detailed analysis of the ${category} reveals critical details. It directly implicates suspect ${implicates[0]}.`,
      implicates,
      exonerates: [],
      unlocksInAct: actPhases[i],
      status: "undiscovered",
      hiddenDetail: prng() > 0.7 ? "UV light reveals hidden blood spatter." : undefined,
      boardPosition: getRandomPosition(prng),
    });
  }

  const timeline: TimelineEvent[] = [
    { id: "tl_1", time: "09:00 PM", description: "Victim was last seen alive.", involvedSuspectIds: [], involvedEvidenceIds: [], act: "act1_hook" },
    { id: "tl_2", time: "11:30 PM", description: "A loud noise was heard.", involvedSuspectIds: [suspects[killerIndex].id], involvedEvidenceIds: [], act: "act2_reversal" },
    { id: "tl_3", time: "11:45 PM", description: "Estimated time of death.", involvedSuspectIds: [], involvedEvidenceIds: [weaponEvId], act: "act3_climax" },
  ];

  return {
    id: `case_${caseSeed}`,
    seed: caseSeed,
    caseNumber: `#VM-${caseSeed}`,
    title: `The Murder of ${victim.name}`,
    date: new Date().toISOString().split("T")[0],
    location: "City of Oakhaven",
    actSummaries: {
      act1_hook: `The body of ${victim.name} is discovered. Initial clues point in multiple directions.`,
      act2_reversal: `New evidence surfaces, breaking initial alibis and revealing hidden motives.`,
      act3_climax: `The final pieces fall into place. The truth cannot stay hidden.`
    },
    victim,
    suspects,
    evidence,
    timeline,
    solution: {
      killerId: suspects[killerIndex].id,
      weaponEvidenceId: weaponEvId,
      motiveIndex: 0,
      fullNarrative: `${suspects[killerIndex].name} committed the murder using the weapon, driven by ${suspects[killerIndex].motive}.`
    }
  };
}
