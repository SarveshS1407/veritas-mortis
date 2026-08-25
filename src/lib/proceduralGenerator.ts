import {
  CaseGraph,
  VictimProfile,
  SuspectArchetype,
  EvidenceNode,
  ChronologyEvent,
  SecretTruth,
  ActPhase,
  ComposureLevel,
  EvidenceType,
} from "@/types/caseEngine";

// Deterministic Mulberry32 PRNG
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom<T>(prng: () => number, list: T[]): T {
  return list[Math.floor(prng() * list.length)];
}

function shuffle<T>(prng: () => number, array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Noir & Thriller Narrative Templates ──
const CASE_THEMES = [
  {
    titlePrefix: "The Blackwood Cyanide",
    setting: "Blackwood Manor, Upper West Wing",
    victimArchetype: {
      name: "Arthur Blackwood",
      occupation: "Venture Financier & Antiquities Collector",
      bloodType: "AB+" as const,
      causeOfDeath: "Acute Asphyxiation via Potassium Cyanide dissolved in Vintage Port",
      primaryInjury: "Severe pulmonary congestion; bitter almond odor emanating from gastric mucosa; no defensive contusions",
      stomachContents: "Partially digested beef tournedos, vintage 1947 port wine, high concentration of potassium cyanide salts",
      timeOfDeath: "22:45 EST",
      earliestTime: "22:30 EST",
      latestTime: "23:00 EST",
      toxicologySummary: "Lethal concentration of potassium cyanide (4.8 mg/L) detected in femoral blood. Traces of diazepam sedative present.",
      location: "Private Study behind heavy oak security doors",
      background: "Blackwood was on the verge of revising his last will and testament, liquidating his family's offshore trust, and exposing a syndicate embezzlement ring."
    },
    weapons: [
      { id: "ev_weapon_port", label: "Crystal Decanter & Vintage Port", type: "BIO" as EvidenceType, desc: "A half-empty crystal decanter of 1947 Niepoort port. Residue at the neck tests positive for potassium cyanide." },
      { id: "ev_weapon_syringe", label: "Medical Glass Syringe (2ml)", type: "PHYSICAL" as EvidenceType, desc: "A stainless-tip glass syringe found concealed inside a hollowed-out legal encyclopedia in the study library." }
    ],
    motives: [
      "Preventing complete disinheritance and exposure of offshore accounts",
      "Retribution for an engineered bankruptcy and corporate betrayal",
      "Covering up illicit black-market antiquity fraud before police disclosure"
    ]
  },
  {
    titlePrefix: "The Vanishing Heiress",
    setting: "The Bellevue Conservatory & Glasshouses",
    victimArchetype: {
      name: "Eleanor Vance-Sterling",
      occupation: "Socialite & Philanthropic Trustee",
      bloodType: "O-" as const,
      causeOfDeath: "Exsanguination secondary to severed left common carotid artery",
      primaryInjury: "Single deep, decisive transverse incision to the left neck. Microscopic glass and silver fibers embedded along incision margin.",
      stomachContents: "Traces of chamomile tea and chloral hydrate sleeping elixir.",
      timeOfDeath: "23:15 EST",
      earliestTime: "23:00 EST",
      latestTime: "23:30 EST",
      toxicologySummary: "Chloral hydrate detected (18 mcg/mL) causing acute central nervous system depression prior to arterial laceration.",
      location: "Exotic Orchid Solarium, Pavilion 4",
      background: "Heiress to the Sterling Locomotive empire. Rumored to possess a sealed wiretap recording implicating members of the municipal council."
    },
    weapons: [
      { id: "ev_weapon_scalpel", label: "Silver-Plated Horticultural Scalpel", type: "PHYSICAL" as EvidenceType, desc: "Heavy surgical pruning knife with blood matching victim's O- type along the distal fuller." },
      { id: "ev_weapon_shards", label: "Fractured Stained-Glass Shard", type: "PHYSICAL" as EvidenceType, desc: "Heavy 19th-century glass shard with wiped fingerprints and micro-scratches on the cutting ridge." }
    ],
    motives: [
      "Interception of the municipal corruption wiretap tapes",
      "Total inheritance of the Sterling Locomotive trust fund",
      "Silencing a blackmailer before public exposure"
    ]
  },
  {
    titlePrefix: "The St. Jude Ballistics Conundrum",
    setting: "St. Jude Naval Docks, Warehouse 9",
    victimArchetype: {
      name: "Marcus Reed",
      occupation: "Chief Naval Quartermaster & Union Delegate",
      bloodType: "A+" as const,
      causeOfDeath: "Perforating gunshot wound to the thoracic aorta",
      primaryInjury: "Close-contact entrance wound over the 4th intercostal space; dense powder tattooing (stippling) indicating muzzle distance under 6 inches.",
      stomachContents: "Whiskey and rye bread, consumed within 90 minutes of death.",
      timeOfDeath: "00:15 EST",
      earliestTime: "00:00 EST",
      latestTime: "00:30 EST",
      toxicologySummary: "Blood alcohol content 0.11g/dL. No narcotics or systemic poisons detected.",
      location: "Office Overlook above the dry dock",
      background: "Reed had cataloged missing military-grade munitions from the shipping manifest and was scheduled to meet federal investigators at dawn."
    },
    weapons: [
      { id: "ev_weapon_revolver", label: "Suppressed .32 ACP Walther PPK", type: "PHYSICAL" as EvidenceType, desc: "Equipped with a makeshift oil-filter silencer; rifling marks match the slug extracted from victim's thoracic spine." },
      { id: "ev_weapon_snub", label: ".38 Special Snubnose Revolver", type: "PHYSICAL" as EvidenceType, desc: "Found discarded in dockyard grease drum with three spent cartridges." }
    ],
    motives: [
      "Preventing military contraband manifest disclosure to the FBI",
      "Eliminating the union delegate before the dockworkers' strike vote",
      "Eliminating a key witness in a high-stakes dockland extortion racket"
    ]
  }
];

const SUSPECT_NAMES = [
  { name: "Desmond Sterling", occ: "Disinherited Heir & Yacht Broker", personality: "Arrogant, calculating, easily agitated when financial privilege is questioned" },
  { name: "Dr. Evelyn Cross", occ: "Personal Physician & Biochemist", personality: "Cold, clinical, hyper-precise, masks severe panic under clinical jargon" },
  { name: "Julian Montgomery", occ: "Senior Estate Solicitor", personality: "Nervous, meticulous, perpetually adjusting his spectacles, fiercely protective of ledgers" },
  { name: "Valerie Vance", occ: "Estranged Sister & Gallery Curator", personality: "Cynical, dramatic, chain-smoker, deeply resentful of victim's fortune" },
  { name: "Captain Thomas Vance", occ: "Retired Naval Officer & Security Chief", personality: "Stoic, disciplined, prone to sudden explosive defensiveness under forensic scrutiny" },
  { name: "Clara Holloway", occ: "Private Secretary & Stenographer", personality: "Quiet, observant, hyper-alert, holds deep leverage over the household" }
];

export function generateCase(seed?: number): CaseGraph {
  const caseSeed = typeof seed === "number" ? seed : Math.floor(Math.random() * 900000) + 100000;
  const prng = createPRNG(caseSeed);

  // 1. Select Theme & Core Murder Mystery Narrative
  const theme = pickRandom(prng, CASE_THEMES);
  const victimData = theme.victimArchetype;

  // 2. Select 3 Distinct Suspects
  const shuffledSuspects = shuffle(prng, SUSPECT_NAMES).slice(0, 3);
  
  // Assign Thriller Roles:
  // - Suspect 0: True Culprit (Insidious, calculated, cracked by micro-forensics)
  // - Suspect 1: Framed Red Herring (Obvious circumstantial suspect in Act 1, cleared in Act 2)
  // - Suspect 2: Blackmailed / Compromised Accomplice (Guilty of a secondary crime)
  const culpritProfile = shuffledSuspects[0];
  const redHerringProfile = shuffledSuspects[1];
  const accompliceProfile = shuffledSuspects[2];

  const culpritId = "suspect_culprit";
  const redHerringId = "suspect_red_herring";
  const accompliceId = "suspect_accomplice";

  const selectedWeapon = theme.weapons[0];
  const secondaryWeapon = theme.weapons[1];
  const primaryMotive = theme.motives[0];

  // 3. Construct Micro-Forensic Evidence Network
  const clueIdContradictCulprit = "ev_forensic_smoking_gun";
  const clueIdContradictRedHerring = "ev_alibi_refutation";
  const clueIdContradictAccomplice = "ev_blackmail_ledger";
  const clueIdReversal = "ev_toxicology_reversal";
  const clueIdUVHidden = "ev_uv_latent_print";
  const clueIdWiretap = "ev_audio_wiretap";

  const evidenceNodes: EvidenceNode[] = [
    // ACT 1: The Setup / Initial Crime Scene Clues
    {
      id: "ev_autopsy_prelim",
      label: "Official Autopsy Pathology Report #701",
      title: "Official Autopsy Pathology Report #701",
      type: "BIO",
      category: "autopsy",
      description: `Comprehensive forensic post-mortem performed on ${victimData.name}. Cause: ${victimData.causeOfDeath}.`,
      summary: `Post-mortem records preliminary estimated time of death between ${victimData.earliestTime} and ${victimData.latestTime}.`,
      fullForensicAnalysis: `PATHOLOGIST NOTES: ${victimData.primaryInjury}. Gastric examination: ${victimData.stomachContents}. Lividity patterns confirm victim was seated and remained undisturbed post-mortem.`,
      fullAnalysis: `PATHOLOGIST NOTES: ${victimData.primaryInjury}. Gastric examination: ${victimData.stomachContents}. Lividity patterns confirm victim was seated and remained undisturbed post-mortem.`,
      implicatesSuspectIds: [redHerringId],
      implicates: [redHerringId],
      exoneratesSuspectIds: [],
      exonerates: [],
      unlocksInAct: "act1_hook",
      status: "discovered",
      stampLabel: "CORONER VERIFIED",
      coordinates: { x: 18, y: 22 },
      boardPosition: { x: 18, y: 22 }
    },
    {
      id: "ev_crime_scene_photo",
      label: "Crime Scene 8x10 Glossy & Staged Glass",
      title: "Crime Scene 8x10 Glossy & Staged Glass",
      type: "PHYSICAL",
      category: "photograph",
      description: `High-contrast monochrome photograph of ${victimData.name} slumped across the mahogany desk at ${theme.setting}.`,
      summary: "Shows victim's personal effects, spilled liquid, and a monocle resting unnaturally on the floorboards.",
      fullForensicAnalysis: "Careful examination reveals that the desk clock was manually stopped at 22:30 by jarring the balance wheel—a deliberate timestamp manipulation.",
      fullAnalysis: "Careful examination reveals that the desk clock was manually stopped at 22:30 by jarring the balance wheel—a deliberate timestamp manipulation.",
      implicatesSuspectIds: [redHerringId],
      implicates: [redHerringId],
      exoneratesSuspectIds: [],
      exonerates: [],
      unlocksInAct: "act1_hook",
      status: "discovered",
      coordinates: { x: 38, y: 18 },
      boardPosition: { x: 38, y: 18 }
    },
    {
      id: selectedWeapon.id,
      label: selectedWeapon.label,
      title: selectedWeapon.label,
      type: selectedWeapon.type,
      category: "weapon",
      description: selectedWeapon.desc,
      summary: `Recovered in close proximity to the victim. Subjected to preliminary chemical swabs.`,
      fullForensicAnalysis: `Spectrometric residue analysis confirms direct link with the lethal trauma. Microscopic skin epithelial cells recovered along the handle.`,
      fullAnalysis: `Spectrometric residue analysis confirms direct link with the lethal trauma. Microscopic skin epithelial cells recovered along the handle.`,
      implicatesSuspectIds: [culpritId, redHerringId],
      implicates: [culpritId, redHerringId],
      exoneratesSuspectIds: [],
      exonerates: [],
      unlocksInAct: "act1_hook",
      status: "undiscovered",
      stampLabel: "BALLISTICS LAB",
      coordinates: { x: 58, y: 24 },
      boardPosition: { x: 58, y: 24 }
    },
    {
      id: clueIdContradictRedHerring,
      label: "Discarded Taxi Cab Receipt & Cigarette Stubs",
      title: "Discarded Taxi Cab Receipt & Cigarette Stubs",
      type: "DOCUMENT",
      category: "document",
      description: `Found crumpled in the entryway ashcan. Dated the evening of the murder.`,
      summary: `Timestamps place ${redHerringProfile.name}'s arrival at the estate earlier than claimed.`,
      fullForensicAnalysis: `Forensic carbon test on the lipstick residue matches ${redHerringProfile.name}. However, entry logs prove they departed the grounds at 22:15—well before the fatal window.`,
      fullAnalysis: `Forensic carbon test on the lipstick residue matches ${redHerringProfile.name}. However, entry logs prove they departed the grounds at 22:15—well before the fatal window.`,
      implicatesSuspectIds: [redHerringId],
      implicates: [redHerringId],
      exoneratesSuspectIds: [redHerringId],
      exonerates: [redHerringId],
      unlocksInAct: "act1_hook",
      status: "undiscovered",
      contradictsSuspectId: redHerringId,
      coordinates: { x: 78, y: 20 },
      boardPosition: { x: 78, y: 20 }
    },

    // ACT 2: The Reversal / Forensic Deep-Dive
    {
      id: clueIdReversal,
      label: "Toxicology Blood Serum Chromatography Report",
      title: "Toxicology Blood Serum Chromatography Report",
      type: "BIO",
      category: "toxicology",
      description: `Lab analysis of victim's femoral blood and liver parenchyma.`,
      summary: victimData.toxicologySummary,
      fullForensicAnalysis: `REVERSAL DISCOVERY: The physiological breakdown rate demonstrates the victim was administered a slow-acting metabolic compound at 21:30, rendering them paralyzed before the final trauma at 22:45. This completely invalidates the initial circumstantial theory!`,
      fullAnalysis: `REVERSAL DISCOVERY: The physiological breakdown rate demonstrates the victim was administered a slow-acting metabolic compound at 21:30, rendering them paralyzed before the final trauma at 22:45. This completely invalidates the initial circumstantial theory!`,
      implicatesSuspectIds: [culpritId],
      implicates: [culpritId],
      exoneratesSuspectIds: [redHerringId],
      exonerates: [redHerringId],
      unlocksInAct: "act2_reversal",
      status: "undiscovered",
      stampLabel: "TOXICOLOGY LAB",
      coordinates: { x: 22, y: 55 },
      boardPosition: { x: 22, y: 55 }
    },
    {
      id: clueIdWiretap,
      label: "Reel-to-Reel Tape: Encrypted Telephony Intercept",
      title: "Reel-to-Reel Tape: Encrypted Telephony Intercept",
      type: "AUDIO",
      category: "wiretap_transcript",
      description: "A 1/4-inch magnetic tape recording intercepted via tap on the estate's private switchboard at 21:40.",
      summary: "Two muffled voices arguing over an imminent legal rewrite and missing bonds.",
      fullForensicAnalysis: "Spectral audio analysis matches the unique vocal cadence and sibilance of the caller to the true culprit discussing 'taking care of Blackwood before midnight'.",
      fullAnalysis: "Spectral audio analysis matches the unique vocal cadence and sibilance of the caller to the true culprit discussing 'taking care of Blackwood before midnight'.",
      audioTranscript: `[VOICE A]: "He's upstairs right now drafting the revocation. If that courier leaves at dawn, we are both ruined."\n[VOICE B]: "The courier won't receive anything. I've prepared the decanter. Just ensure the staff is cleared from the south corridor."`,
      implicatesSuspectIds: [culpritId, accompliceId],
      implicates: [culpritId, accompliceId],
      exoneratesSuspectIds: [],
      exonerates: [],
      unlocksInAct: "act2_reversal",
      status: "undiscovered",
      coordinates: { x: 45, y: 58 },
      boardPosition: { x: 45, y: 58 }
    },
    {
      id: clueIdContradictAccomplice,
      label: "Encrypted Blackmail Ledger & Embezzlement Slips",
      title: "Encrypted Blackmail Ledger & Embezzlement Slips",
      type: "DOCUMENT",
      category: "document",
      description: `Recovered from behind the wall safe in the guest annex.`,
      summary: `Contains systematic records of bearer bond siphoning signed under aliases.`,
      fullForensicAnalysis: `Proves ${accompliceProfile.name} was blackmailed by the victim, establishing a strong motive for forgery, but conclusively places them in the cellar destroying documents during the murder.`,
      fullAnalysis: `Proves ${accompliceProfile.name} was blackmailed by the victim, establishing a strong motive for forgery, but conclusively places them in the cellar destroying documents during the murder.`,
      implicatesSuspectIds: [accompliceId],
      implicates: [accompliceId],
      exoneratesSuspectIds: [accompliceId],
      exonerates: [accompliceId],
      unlocksInAct: "act2_reversal",
      status: "undiscovered",
      contradictsSuspectId: accompliceId,
      coordinates: { x: 68, y: 52 },
      boardPosition: { x: 68, y: 52 }
    },

    // ACT 3: The Climax / Smoking Gun Proof
    {
      id: clueIdUVHidden,
      label: "Antique Leather Desk Blotter & UV Latent Fingerprint",
      title: "Antique Leather Desk Blotter & UV Latent Fingerprint",
      type: "UV_HIDDEN",
      category: "fingerprint",
      description: "The leather desk blotter positioned directly before the victim's chair.",
      summary: "Appears clean to the naked eye under tungsten precinct lighting.",
      fullForensicAnalysis: "Under 365nm UV Blacklight illumination, latent luminescent chemical fingerprints appear along the edge, matching the culprit's right index whorl pattern mixed with poison residue.",
      fullAnalysis: "Under 365nm UV Blacklight illumination, latent luminescent chemical fingerprints appear along the edge, matching the culprit's right index whorl pattern mixed with poison residue.",
      hiddenUVDetails: `[UV 365nm ACTIVE]: Luminescent chemical residue reveals latent right-hand fingerprint whorls matching Culprit ID #${culpritId}. Trace potassium compound halo detected.`,
      hiddenDetail: `[UV 365nm ACTIVE]: Luminescent chemical residue reveals latent right-hand fingerprint whorls matching Culprit ID #${culpritId}. Trace potassium compound halo detected.`,
      implicatesSuspectIds: [culpritId],
      implicates: [culpritId],
      exoneratesSuspectIds: [],
      exonerates: [],
      unlocksInAct: "act3_climax",
      status: "undiscovered",
      stampLabel: "UV FORENSIC DISCOVERY",
      coordinates: { x: 30, y: 82 },
      boardPosition: { x: 30, y: 82 }
    },
    {
      id: clueIdContradictCulprit,
      label: "The Fatal Discrepancy: Monogrammed Fountain Pen & Wax Seal",
      title: "The Fatal Discrepancy: Monogrammed Fountain Pen & Wax Seal",
      type: "PHYSICAL",
      category: "weapon",
      description: "The gold-nib fountain pen used to initial the amended inheritance trust.",
      summary: "Found slipped beneath the study radiator with a freshly stamped wax flake.",
      fullForensicAnalysis: `FATAL CONTRADICTION: The ink reservoir contains micro-droplets of the victim's blood. Only ${culpritProfile.name} possessed access to this pen at the exact time of the murder, directly contradicting their claim of being in transit to the city club!`,
      fullAnalysis: `FATAL CONTRADICTION: The ink reservoir contains micro-droplets of the victim's blood. Only ${culpritProfile.name} possessed access to this pen at the exact time of the murder, directly contradicting their claim of being in transit to the city club!`,
      implicatesSuspectIds: [culpritId],
      implicates: [culpritId],
      exoneratesSuspectIds: [],
      exonerates: [],
      unlocksInAct: "act3_climax",
      status: "undiscovered",
      contradictsSuspectId: culpritId,
      stampLabel: "SMOKING GUN",
      coordinates: { x: 62, y: 85 },
      boardPosition: { x: 62, y: 85 }
    }
  ];

  // 4. Construct Suspect Archetypes & Composure Dialectics
  const suspects: SuspectArchetype[] = [
    // 1. Culprit
    {
      id: culpritId,
      name: culpritProfile.name,
      age: 42,
      occupation: culpritProfile.occ,
      role: culpritProfile.occ,
      personality: culpritProfile.personality,
      composure: "CALM",
      composureLevel: "CALM",
      stressLevel: 10,
      alibiStatement: `I arrived at the Metropolitan Club at 22:00 sharp and played baccarat until 01:30 in the morning. Several doormen will corroborate my presence.`,
      alibi: `I arrived at the Metropolitan Club at 22:00 sharp and played baccarat until 01:30 in the morning. Several doormen will corroborate my presence.`,
      hiddenSecret: `Engineered an offshore shell corporation to siphon millions from the estate, set to be exposed the very next morning.`,
      motive: primaryMotive,
      isGuilty: true,
      contradictionClueId: clueIdContradictCulprit,
      contradictionEvidenceId: clueIdContradictCulprit,
      confessionDialogue: `Enough! Stop waving that damn pen in my face! Arthur was going to strip everything away—decades of labor reduced to ashes over a ledger audit! Yes, I poisoned the decanter. And if I had the chance, I would do it again without a second thought!`,
      dialogueByComposure: {
        CALM: [
          `Detective, my ledger and my schedule are both open books. Ask what you will.`,
          `Arthur was a dear associate. His passing is a tragedy, but you won't find answers by harassing his closest partners.`,
          `I suggest you look into the people who actually had debts with him, rather than wasting your breath here.`
        ],
        DEFLECTING: [
          `Are you insinuating something? Check the Metropolitan Club guest registry if you doubt my word.`,
          `Why aren't you interrogating the sister? Everyone in town knows she threatened him over the inheritance last week!`,
          `You are reaching for shadows in the dark, Detective. I have top counsel on retainer.`
        ],
        CORNERED: [
          `Where did you unearth that document?! That was in a private safe! That proves nothing!`,
          `The clock in the study was wrong! Anyone could have entered that room before me!`,
          `Stop twisting my words! You have no eyewitnesses, no ballistics, only circumstantial conjecture!`
        ],
        BROKEN: [
          `God... it was never supposed to get this far. Arthur wouldn't listen to reason.`,
          `He had the document right there on the mahogany table... he was going to ruin me by dawn...`,
          `Fine! Put the cuffs on. Just get me out from under these blinding lights!`
        ]
      },
      bodyLanguageCues: {
        CALM: "*[Leans back comfortably in the chair; taps an expensive silver cigarette case with measured calm]*",
        DEFLECTING: "*[Crosses arms tightly across chest; eyes dart repeatedly toward the interrogation room door]*",
        CORNERED: "*[A noticeable micro-tremor shakes their left hand; collar is loosened with sweating fingers]*",
        BROKEN: "*[Buries face in trembling palms; shoulders violently heaving under the harsh overhead lamp]*"
      },
      portraitDescription: "A sharp, immaculate figure in a tailored charcoal wool suit, whose composed aristocratic demeanor conceals ruthless desperation.",
      boardPosition: { x: 50, y: 15 },
      interrogationCount: 0
    },

    // 2. Framed Red Herring
    {
      id: redHerringId,
      name: redHerringProfile.name,
      age: 38,
      occupation: redHerringProfile.occ,
      role: redHerringProfile.occ,
      personality: redHerringProfile.personality,
      composure: "DEFLECTING",
      composureLevel: "DEFLECTING",
      stressLevel: 45,
      alibiStatement: `I was at home asleep in my flat on 4th Avenue. I haven't set foot in the manor since last Tuesday.`,
      alibi: `I was at home asleep in my flat on 4th Avenue. I haven't set foot in the manor since last Tuesday.`,
      hiddenSecret: `Went to the manor at 21:45 to beg for a loan extension, had a screaming argument, but fled the grounds in panic at 22:15 when Arthur refused.`,
      motive: "Severe personal debts and an explosive public dispute with the victim",
      isGuilty: false,
      contradictionClueId: clueIdContradictRedHerring,
      contradictionEvidenceId: clueIdContradictRedHerring,
      confessionDialogue: `Alright! I lied about being asleep! I was there at the estate at 21:45! We argued over the loan, and I screamed at him, but he was ALIVE when I stormed out to hail a cab at 22:15! You have to believe me!`,
      dialogueByComposure: {
        CALM: [
          `I told the beat officers already: I was nowhere near the estate last night.`,
          `Arthur and I had differences, sure, but murder? That's ridiculous.`
        ],
        DEFLECTING: [
          `Why are you staring at me like that? Dozens of people hated Arthur Blackwood!`,
          `Look at his business associates if you want blood money, not me!`
        ],
        CORNERED: [
          `Okay, look... I might have been seen near the gates, but that doesn't mean I went inside!`,
          `Don't pin this on me! Someone is setting me up to take the fall!`
        ],
        BROKEN: [
          `I didn't kill him! I swear on my life! He was sitting in that chair, drinking his port when I left!`,
          `I only wanted the loan extension... I couldn't hurt a fly!`
        ]
      },
      bodyLanguageCues: {
        CALM: "*[Sits rigidly upright, maintaining defensive eye contact]*",
        DEFLECTING: "*[Bites lower lip nervously; repeatedly adjusts coat lapels]*",
        CORNERED: "*[Breathing becomes shallow and rapid; grips the edges of the metal table]*",
        BROKEN: "*[Voice breaks into a desperate sob; leans forward pleadingly]*"
      },
      portraitDescription: "A disheveled, high-strung individual with dark circles under the eyes, reeking of stale tobacco and anxiety.",
      boardPosition: { x: 20, y: 15 },
      interrogationCount: 0
    },

    // 3. Blackmailed Accomplice / Secondary Suspect
    {
      id: accompliceId,
      name: accompliceProfile.name,
      age: 51,
      occupation: accompliceProfile.occ,
      role: accompliceProfile.occ,
      personality: accompliceProfile.personality,
      composure: "CALM",
      composureLevel: "CALM",
      stressLevel: 30,
      alibiStatement: `I was cataloging estate records in the basement archives between 21:00 and midnight without interruption.`,
      alibi: `I was cataloging estate records in the basement archives between 21:00 and midnight without interruption.`,
      hiddenSecret: `Was actively incinerating forged promissory notes in the basement furnace after being blackmailed by Arthur.`,
      motive: "Covering up forged signatures before an audit",
      isGuilty: false,
      contradictionClueId: clueIdContradictAccomplice,
      contradictionEvidenceId: clueIdContradictAccomplice,
      confessionDialogue: `Yes, I forged the conveyance deeds! Arthur had me under his thumb for six months! But I was burning those papers in the incinerator when the gunshot or poison took him! I am a thief, Detective, but I am NOT a killer!`,
      dialogueByComposure: {
        CALM: [
          `The estate records are under my strict custody. Everything is in order.`,
          `I heard nothing from the upper floors during my archival review.`
        ],
        DEFLECTING: [
          `Financial discrepancies are civil matters, Detective, completely unrelated to this violence.`,
          `Arthur had enemies far more dangerous than anyone in this room.`
        ],
        CORNERED: [
          `Those furnace ashes have nothing to do with homicide! That was confidential correspondence!`,
          `You cannot hold me on financial technicalities while a killer walks the streets!`
        ],
        BROKEN: [
          `Arthur was blackmailing me... he had me by the throat with those old ledger discrepancies.`,
          `I heard heavy footsteps above me around 22:45, but I was too terrified to come up...`
        ]
      },
      bodyLanguageCues: {
        CALM: "*[Polishes wireframe glasses with a silk handkerchief with deliberate slowness]*",
        DEFLECTING: "*[Clears throat repeatedly; shuffles papers on the desk to hide trembling fingers]*",
        CORNERED: "*[Eyes dart frantically; perspiration visibly beads along the receding hairline]*",
        BROKEN: "*[Removes glasses completely; slumps forward in complete exhaustion]*"
      },
      portraitDescription: "A conservative, bookish figure with a sharp intellect, trapped in a web of financial deceit.",
      boardPosition: { x: 80, y: 15 },
      interrogationCount: 0
    }
  ];

  // 5. Build Timeline & Chronology Events
  const timeline: ChronologyEvent[] = [
    {
      id: "tl_1",
      timestamp: "21:30 EST",
      time: "21:30 EST",
      act: "act1_hook",
      description: `Victim is observed in the private study. Culprit covertly laces the crystal port decanter with potassium cyanide and sedative admixture.`,
      associatedSuspectIds: [culpritId],
      associatedEvidenceIds: [selectedWeapon.id, clueIdReversal],
      involvedSuspectIds: [culpritId],
      involvedEvidenceIds: [selectedWeapon.id, clueIdReversal],
      isCrucialContradictionPoint: true
    },
    {
      id: "tl_2",
      timestamp: "21:45 EST",
      time: "21:45 EST",
      act: "act1_hook",
      description: `${redHerringProfile.name} arrives at the estate and has a loud verbal dispute with the victim regarding debts.`,
      associatedSuspectIds: [redHerringId],
      associatedEvidenceIds: [clueIdContradictRedHerring],
      involvedSuspectIds: [redHerringId],
      involvedEvidenceIds: [clueIdContradictRedHerring],
      isCrucialContradictionPoint: false
    },
    {
      id: "tl_3",
      timestamp: "22:15 EST",
      time: "22:15 EST",
      act: "act2_reversal",
      description: `${redHerringProfile.name} storms out in tears and hails a taxi cab on 5th Avenue, exonerating them from the subsequent lethal window.`,
      associatedSuspectIds: [redHerringId],
      associatedEvidenceIds: [clueIdContradictRedHerring],
      involvedSuspectIds: [redHerringId],
      involvedEvidenceIds: [clueIdContradictRedHerring],
      isCrucialContradictionPoint: true
    },
    {
      id: "tl_4",
      timestamp: "22:45 EST",
      time: "22:45 EST",
      act: "act3_climax",
      description: `Victim collapses from cyanide poisoning. Culprit returns to the study to retrieve the amended will, leaving latent UV prints and ink traces.`,
      associatedSuspectIds: [culpritId],
      associatedEvidenceIds: [clueIdUVHidden, clueIdContradictCulprit],
      involvedSuspectIds: [culpritId],
      involvedEvidenceIds: [clueIdUVHidden, clueIdContradictCulprit],
      isCrucialContradictionPoint: true
    }
  ];

  // 6. Master Secret Ground Truth & Solution
  const secretTruth: SecretTruth = {
    culpritId: culpritId,
    murderWeaponClueId: selectedWeapon.id,
    weaponEvidenceId: selectedWeapon.id,
    murderWeaponEvidenceId: selectedWeapon.id,
    motiveSummary: primaryMotive,
    motiveIndex: 0,
    primaryMotive: primaryMotive,
    act1FalseLeadSuspectId: redHerringId,
    act2ReversalClueId: clueIdReversal,
    act3FinalContradictionClueId: clueIdContradictCulprit,
    fullNarrativeChronicle: `On the night of the murder, ${culpritProfile.name} laced the victim's port decanter with potassium cyanide at 21:30 to prevent total disinheritance and financial exposure. While ${redHerringProfile.name} initially appeared guilty due to a heated 21:45 dispute, forensic taxi manifests proved they departed at 22:15. Blood chromatography and UV latent fingerprints conclusively pinned ${culpritProfile.name} to the murder scene during the 22:45 fatal collapse.`,
    fullNarrative: `On the night of the murder, ${culpritProfile.name} laced the victim's port decanter with potassium cyanide at 21:30 to prevent total disinheritance and financial exposure. While ${redHerringProfile.name} initially appeared guilty due to a heated 21:45 dispute, forensic taxi manifests proved they departed at 22:15. Blood chromatography and UV latent fingerprints conclusively pinned ${culpritProfile.name} to the murder scene during the 22:45 fatal collapse.`
  };

  const victim: VictimProfile = {
    id: "vic_master_01",
    name: victimData.name,
    age: 58,
    occupation: victimData.occupation,
    bloodType: victimData.bloodType,
    timeOfDeath: victimData.timeOfDeath,
    causeOfDeath: victimData.causeOfDeath,
    locationFound: victimData.location,
    toxicologyNotes: {
      substancesDetected: ["Potassium Cyanide", "Diazepam", "Ethanol"],
      bloodAlcoholLevel: 0.08,
      serumAnomalies: victimData.toxicologySummary,
      isFatalToxicity: true
    },
    autopsyDetails: {
      primaryInjury: victimData.primaryInjury,
      defensiveWounds: false,
      stomachContents: victimData.stomachContents,
      estimatedTimeWindow: {
        earliest: victimData.earliestTime,
        latest: victimData.latestTime
      },
      pathologistNotes: `Pathology signs consistent with lethal ingestion. Petechial hemorrhages in conjunctiva; cellular hypoxia.`
    },
    backgroundDossier: victimData.background,
    autopsySummary: `Coroner report for ${victimData.name}. ${victimData.causeOfDeath}. Estimated TOD: ${victimData.timeOfDeath}.`,
    backgroundNotes: victimData.background
  };

  return {
    id: `case_${caseSeed}`,
    seed: caseSeed,
    caseNumber: `#VM-${caseSeed}`,
    title: `${theme.titlePrefix}: Case #${caseSeed}`,
    date: "November 14, 1974",
    crimeSceneLocation: theme.setting,
    location: theme.setting,
    currentAct: "act1_hook",
    act: "act1_hook",
    victim,
    suspects,
    evidenceNodes,
    evidence: evidenceNodes,
    timeline,
    narrativeActs: {
      act1_hook: `ACT 1 (THE HOOK): ${victimData.name} is found deceased in ${theme.setting}. Circumstantial evidence and loud arguments point immediately toward ${redHerringProfile.name}.`,
      act2_reversal: `ACT 2 (THE REVERSAL): Toxicology chromatography and cab timestamps shatter the case against ${redHerringProfile.name}. A deeper web of wiretaps and embezzled bonds surfaces.`,
      act3_climax: `ACT 3 (THE CLIMAX): Forensic UV blacklight scans and ink chemical signatures corner ${culpritProfile.name}, forcing an unvarnished confession.`
    },
    actSummaries: {
      act1_hook: `ACT 1 (THE HOOK): ${victimData.name} is found deceased in ${theme.setting}. Circumstantial evidence and loud arguments point immediately toward ${redHerringProfile.name}.`,
      act2_reversal: `ACT 2 (THE REVERSAL): Toxicology chromatography and cab timestamps shatter the case against ${redHerringProfile.name}. A deeper web of wiretaps and embezzled bonds surfaces.`,
      act3_climax: `ACT 3 (THE CLIMAX): Forensic UV blacklight scans and ink chemical signatures corner ${culpritProfile.name}, forcing an unvarnished confession.`
    },
    secretTruth,
    solution: secretTruth
  };
}
