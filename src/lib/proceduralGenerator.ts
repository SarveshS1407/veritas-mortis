import type {
  CaseGraph,
  VictimProfile,
  SuspectArchetype,
  EvidenceNode,
  ChronologyEvent,
  SecretTruth,
  ActPhase,
  ComposureLevel,
  EvidenceType,
} from "../types/caseEngine.ts";

// Deterministic Mulberry32 PRNG
export function createPRNG(seed: number) {
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

// ── 8 Deep Neo-Noir & Psychological Thriller Case Themes ──
interface CaseThemeDefinition {
  id: string;
  titlePrefix: string;
  setting: string;
  victimArchetype: {
    name: string;
    age: number;
    occupation: string;
    bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    causeOfDeath: string;
    primaryInjury: string;
    stomachContents: string;
    timeOfDeath: string;
    earliestTime: string;
    latestTime: string;
    toxicologySummary: string;
    location: string;
    background: string;
  };
  weapons: {
    id: string;
    label: string;
    type: EvidenceType;
    desc: string;
    forensicNotes: string;
  }[];
  motives: string[];
  reversalClueName: string;
  reversalDiscovery: string;
  smokingGunName: string;
  smokingGunDetail: string;
}

const CASE_THEMES: CaseThemeDefinition[] = [
  {
    id: "blackwood_cyanide",
    titlePrefix: "The Blackwood Cyanide",
    setting: "Blackwood Manor, Upper West Wing",
    victimArchetype: {
      name: "Arthur Blackwood",
      age: 58,
      occupation: "Venture Financier & Antiquities Collector",
      bloodType: "AB+",
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
      {
        id: "ev_weapon_port",
        label: "Crystal Decanter & Vintage Port",
        type: "BIO",
        desc: "A half-empty crystal decanter of 1947 Niepoort port. Residue at the neck tests positive for potassium cyanide.",
        forensicNotes: "Spectrometry confirms the cyanide was suspended in ethanol; lip contact residues match victim's saliva."
      },
      {
        id: "ev_weapon_syringe",
        label: "Medical Glass Syringe (2ml)",
        type: "PHYSICAL",
        desc: "A stainless-tip glass syringe found concealed inside a hollowed-out legal encyclopedia in the study library.",
        forensicNotes: "Micro-droplets inside the barrel contain traces of pharmaceutical diazepam and cyanide crystals."
      }
    ],
    motives: [
      "Preventing complete disinheritance and exposure of offshore siphon accounts",
      "Retribution for an engineered bankruptcy and corporate betrayal in 1968",
      "Covering up illicit black-market antiquity fraud before police disclosure"
    ],
    reversalClueName: "Toxicology Blood Serum Chromatography Report",
    reversalDiscovery: "The metabolic breakdown rate demonstrates the victim was administered a slow-acting sedative at 21:30, rendering them paralyzed before the poison ingestion at 22:45. This dismantles the initial false frame!",
    smokingGunName: "The Fatal Discrepancy: Monogrammed Fountain Pen & Wax Seal",
    smokingGunDetail: "The gold-nib fountain pen contains microscopic blood and poison residue on the grip, accessible only to the true culprit during the fatal window."
  },
  {
    id: "bellevue_solarium",
    titlePrefix: "The Bellevue Solarium",
    setting: "The Bellevue Conservatory & Glasshouses",
    victimArchetype: {
      name: "Eleanor Vance-Sterling",
      age: 46,
      occupation: "Socialite & Philanthropic Trustee",
      bloodType: "O-",
      causeOfDeath: "Exsanguination secondary to severed left common carotid artery",
      primaryInjury: "Single deep, decisive transverse incision to the left neck. Microscopic glass and silver fibers embedded along incision margin.",
      stomachContents: "Traces of chamomile tea and chloral hydrate sleeping elixir.",
      timeOfDeath: "23:15 EST",
      earliestTime: "23:00 EST",
      latestTime: "23:30 EST",
      toxicologySummary: "Chloral hydrate detected (18 mcg/mL) causing acute central nervous system depression prior to arterial laceration.",
      location: "Exotic Orchid Solarium, Pavilion 4",
      background: "Heiress to the Sterling Locomotive empire. Possessed a sealed wiretap recording implicating prominent municipal trustees."
    },
    weapons: [
      {
        id: "ev_weapon_scalpel",
        label: "Silver-Plated Horticultural Scalpel",
        type: "PHYSICAL",
        desc: "Heavy surgical pruning knife with blood matching victim's O- type along the distal fuller.",
        forensicNotes: "Blade geometry matches the transverse neck wound with 0.1mm accuracy. Grip wiped clean with solvent."
      },
      {
        id: "ev_weapon_shards",
        label: "Fractured Stained-Glass Shard",
        type: "PHYSICAL",
        desc: "Heavy 19th-century glass shard with wiped fingerprints and micro-scratches on the cutting ridge.",
        forensicNotes: "Secondary weapon used to stage a struggle after the victim had already lost consciousness."
      }
    ],
    motives: [
      "Interception of the municipal corruption wiretap tapes before public disclosure",
      "Total inheritance of the Sterling Locomotive trust fund",
      "Silencing a blackmailer before criminal indictment"
    ],
    reversalClueName: "Orchid Solarium Humidity Log & Chemical Analysis",
    reversalDiscovery: "The automated thermohygrograph recorded a sudden temperature drop at 22:50 when the north delivery airlock was forced open, proving the killer entered via the service tunnel, clearing the framed front-gate visitor!",
    smokingGunName: "Tailored Silk Glove with Stained-Glass Glass Dust",
    smokingGunDetail: "Micro-spectrometry identified unique cobalt glass dust in the seams of the glove, owned exclusively by the true culprit."
  },
  {
    id: "st_jude_ballistics",
    titlePrefix: "The St. Jude Ballistics Conundrum",
    setting: "St. Jude Naval Docks, Pier Warehouse 9",
    victimArchetype: {
      name: "Marcus Reed",
      age: 51,
      occupation: "Chief Naval Quartermaster & Union Delegate",
      bloodType: "A+",
      causeOfDeath: "Perforating gunshot wound to the thoracic aorta",
      primaryInjury: "Close-contact entrance wound over the 4th intercostal space; dense powder tattooing (stippling) indicating muzzle distance under 6 inches.",
      stomachContents: "Whiskey and rye bread, consumed within 90 minutes of death.",
      timeOfDeath: "00:15 EST",
      earliestTime: "00:00 EST",
      latestTime: "00:30 EST",
      toxicologySummary: "Blood alcohol content 0.11g/dL. No narcotics or systemic poisons detected.",
      location: "Office Overlook above the dry dock",
      background: "Reed had cataloged missing military-grade munitions from the shipping manifest and was scheduled to meet federal prosecutors at dawn."
    },
    weapons: [
      {
        id: "ev_weapon_revolver",
        label: "Suppressed .32 ACP Walther PPK",
        type: "PHYSICAL",
        desc: "Equipped with a makeshift oil-filter silencer; rifling marks match the slug extracted from victim's thoracic spine.",
        forensicNotes: "Ballistic striations on the recovered slug match the chamber lands of this specific Walther frame."
      },
      {
        id: "ev_weapon_snub",
        label: ".38 Special Snubnose Revolver",
        type: "PHYSICAL",
        desc: "Found discarded in dockyard grease drum with three spent cartridges.",
        forensicNotes: "Unfired decoy firearm intended to confuse ballistic caliber confirmation."
      }
    ],
    motives: [
      "Preventing military contraband manifest disclosure to federal authorities",
      "Eliminating the union delegate before the dockworkers' strike vote",
      "Eliminating a key witness in a high-stakes maritime extortion racket"
    ],
    reversalClueName: "Acoustic Harbor Microphone Decibel Log",
    reversalDiscovery: "The naval base acoustic hydrophone array recorded the muffled acoustic discharge at 23:48, 27 minutes earlier than the staged alarm, proving the first suspect was still at the dock gate clock-in!",
    smokingGunName: "Custom Machined Silencer Baffle with Solvent Resins",
    smokingGunDetail: "The silencer baffle threading matches the lathe tooling in the culprit's private machine shop."
  },
  {
    id: "highgate_cryptography",
    titlePrefix: "The Highgate Cipher Murder",
    setting: "Highgate Antiquarian Archives & Rare Books Vault",
    victimArchetype: {
      name: "Prof. Thaddeus Vance",
      age: 63,
      occupation: "Emeritus Cryptographer & Rare Manuscript Conservator",
      bloodType: "B+",
      causeOfDeath: "Mechanical Asphyxiation via Velvet Cord Strangulation",
      primaryInjury: "Narrow, deeply grooved horizontal ligature mark above the thyroid cartilage; petechial hemorrhages in conjunctivae.",
      stomachContents: "Black coffee and peppermint pastilles.",
      timeOfDeath: "21:30 EST",
      earliestTime: "21:15 EST",
      latestTime: "21:45 EST",
      toxicologySummary: "Negative for narcotics. Trace belladonna eye-drop solution in tear ducts.",
      location: "Secured Reading Vault behind double steel grilles",
      background: "Decoded an encrypted ledger documenting wartime gold laundering by elite banking families."
    },
    weapons: [
      {
        id: "ev_weapon_cord",
        label: "Braided Velvet Bell-Pull Cord",
        type: "PHYSICAL",
        desc: "Heavy gold-trimmed silk velvet cord torn from the archive study drapery, showing friction burn fibers.",
        forensicNotes: "Weave pattern matches the ligature groove on victim's cervical spine; fibers impregnated with archive dust."
      },
      {
        id: "ev_weapon_paperweight",
        label: "Bronze Medici Paperweight",
        type: "PHYSICAL",
        desc: "Heavy bronze bust found displaced on the reading table with faint trace contact marks.",
        forensicNotes: "Used to subdue the victim momentarily from behind before the ligature application."
      }
    ],
    motives: [
      "Suppressing the decoded wartime laundering ledger before public academic lecture",
      "Theft of the original encrypted manuscript valued at half a million pounds",
      "Preventing exposure of a thirty-year academic forgery syndicate"
    ],
    reversalClueName: "Vault Pneumatic Tube Delivery Dispatch Log",
    reversalDiscovery: "The pneumatic carrier log reveals the vault capsule was returned from the cataloguing sub-floor at 21:20 with an automated seal, confirming the framed research assistant had already clocked out!",
    smokingGunName: "The Missing Cipher Decryption Matrix Page",
    smokingGunDetail: "The torn folio from the victim's cryptographic notebook was found hidden inside the culprit's leather briefcase lining."
  },
  {
    id: "alderney_cliff",
    titlePrefix: "The Alderney Promontory Fall",
    setting: "Alderney Lightstation, Storm Overlook",
    victimArchetype: {
      name: "Captain Donald Graves",
      age: 55,
      occupation: "Principal Lighthouse Keeper & Maritime Inspector",
      bloodType: "O+",
      causeOfDeath: "Polytrauma secondary to 80-foot impact onto coastal granite reefs",
      primaryInjury: "Severe basilar skull fracture and multiple comminuted fractures of ribcage; defensive lacerations to dorsal forearms.",
      stomachContents: "Tinned mutton and naval rum.",
      timeOfDeath: "23:45 EST",
      earliestTime: "23:30 EST",
      latestTime: "00:00 EST",
      toxicologySummary: "Ethanol level 0.04g/dL (mild). Pre-impact adrenaline spike detected in cardiac blood.",
      location: "Sharp reef basin directly beneath the foghorn parapet",
      background: "Had discovered contraband smuggling crates routed through the lighthouse supply tender."
    },
    weapons: [
      {
        id: "ev_weapon_crowbar",
        label: "Weathered Brass Foghorn Lever",
        type: "PHYSICAL",
        desc: "Heavy cast-brass lever detached from the lighthouse air-compressor housing.",
        forensicNotes: "Minute paint transfers match the scratched safety rail of the overlook platform."
      },
      {
        id: "ev_weapon_flare",
        label: "Magnesium Emergency Signal Flare",
        type: "PHYSICAL",
        desc: "Discharged casing found on the cliff edge with scorched sea-salt grass.",
        forensicNotes: "Used to blind and disorient the victim prior to the fatal struggle over the cliff edge."
      }
    ],
    motives: [
      "Preventing maritime smuggling route exposure to Coast Guard investigators",
      "Eliminating the keeper before the maritime insurance inspection",
      "Silencing a witness to a deliberate coastal shipwreck orchestration"
    ],
    reversalClueName: "Lighthouse Keeper's Barometric Pressure Ledger",
    reversalDiscovery: "The mechanical barograph in the lantern room shows the outer storm door was bolted from the inside until 23:55, establishing that the fall happened from the lower catwalk, not the framed keeper's station!",
    smokingGunName: "Salt-Encrusted Oilskin Coat with Torn Brass Button",
    smokingGunDetail: "The brass button recovered from the victim's clenched left fist matches the missing hardware on the culprit's storm coat."
  },
  {
    id: "carlyle_auction",
    titlePrefix: "The Carlyle Vault Poisoning",
    setting: "Carlyle Fine Arts & Rare Antiquities Auctioneers",
    victimArchetype: {
      name: "Julian H. Montgomery",
      age: 60,
      occupation: "Senior Auction Partner & Rare Manuscript Appraiser",
      bloodType: "A-",
      causeOfDeath: "Fatal Ventricular Arrhythmia via Purified Aconite Alkaloid",
      primaryInjury: "Numbness of perioral tissues and intense cardiac arrest; no traumatic surface wounds.",
      stomachContents: "Earl Grey tea, lemon rind, and lethal dosage of Aconitum napellus extract.",
      timeOfDeath: "20:30 EST",
      earliestTime: "20:15 EST",
      latestTime: "20:45 EST",
      toxicologySummary: "Lethal aconitine concentration (8.2 ng/mL) in blood. Rapid onset paralysis within 25 minutes of ingestion.",
      location: "Private Appraisal Salon & Vault #3",
      background: "Was about to declare the centerpiece Lot #42 (The Romanov Tiara) a modern counterfeit before the gala."
    },
    weapons: [
      {
        id: "ev_weapon_teacup",
        label: "Fine Bone-China Teacup & Saucer",
        type: "BIO",
        desc: "Limoges porcelain teacup found on the appraisal desk. Residue in the dregs tests positive for aconite.",
        forensicNotes: "Thin crystalline film of aconitine alkaloid concentrated along the gold-leaf drinking rim."
      },
      {
        id: "ev_weapon_vial",
        label: "Amber Glass Apothecary Dropper Vial",
        type: "PHYSICAL",
        desc: "Found tucked into the ventilation grate of the second-floor appraisal gallery.",
        forensicNotes: "Chemical spectrometry matches the precise botanical subspecies of the lethal poison."
      }
    ],
    motives: [
      "Preventing the public exposure of the million-dollar counterfeit auction lot",
      "Securing the estate valuation commission exclusively for the firm's junior partner",
      "Stopping an audit into thirty years of switched client consignments"
    ],
    reversalClueName: "Gallery Catering Shift Schedule & Tea Order Slip",
    reversalDiscovery: "The kitchen order ticket confirms the tea tray was prepared at 19:45 and delivered by the pantry maid before the framed client had even arrived at the auction reception!",
    smokingGunName: "The Master Lot Catalog with Hidden Appraisal Seal",
    smokingGunDetail: "The culprit's private desk copy contained handwritten marginalia detailing the counterfeit swap and poison dosages."
  },
  {
    id: "blackfriars_vault",
    titlePrefix: "The Blackfriars Bullion Bludgeoning",
    setting: "Blackfriars Safe Deposit & Trust, Deep Vault B",
    victimArchetype: {
      name: "Cedric Holbrooke",
      age: 52,
      occupation: "Chief Vault Custodian & Gold Bullion Auditor",
      bloodType: "B-",
      causeOfDeath: "Depressed Comminuted Fracture of the Parietal Bone with Cerebral Contusion",
      primaryInjury: "Triangular depressed cranial fracture consistent with heavy blunt corner impact; defensive bruising to right knuckles.",
      stomachContents: "Black coffee and salt beef sandwich.",
      timeOfDeath: "19:40 EST",
      earliestTime: "19:20 EST",
      latestTime: "20:00 EST",
      toxicologySummary: "Zero alcohol or drugs. High levels of adrenaline and lactic acid indicating a violent pre-mortem struggle.",
      location: "Subterranean Bullion Staging Area, Bay 14",
      background: "Audited a 1,200-ounce shortage of investment-grade gold bars due for shipment to Zurich."
    },
    weapons: [
      {
        id: "ev_weapon_ingot",
        label: "1-Kilogram Tungsten-Core Gold Bar",
        type: "PHYSICAL",
        desc: "Gold-plated counterfeit bullion bar found abandoned near the vault conveyor with victim's blood on the beveled edge.",
        forensicNotes: "Edge radius and beveled corner match the triangular cranial impression on the victim."
      },
      {
        id: "ev_weapon_wrench",
        label: "Heavy Drop-Forged Steel Vault Wrench",
        type: "PHYSICAL",
        desc: "Found in maintenance cart with wiped oil and traces of cleaning solvent.",
        forensicNotes: "Secondary tool used to jam the emergency hydraulic vault door open."
      }
    ],
    motives: [
      "Preventing the discovery of the multi-million dollar tungsten-bullion substitution fraud",
      "Covering up an inside heist planned for the bank holiday weekend",
      "Stopping an immediate police report regarding stolen vault keys"
    ],
    reversalClueName: "Dual-Key Time Lock Chronograph Card",
    reversalDiscovery: "The vault's mechanical twin-clock card registered a mechanical lock bypass at 19:15 using a master override key held only by senior bank executives, exonerating the junior night watchman!",
    smokingGunName: "Custom Jeweler's Gold Assay Balance with Tungsten Shavings",
    smokingGunDetail: "Micro-shavings of tungsten and counterfeit gilding solder were found in the culprit's private desk drawer."
  },
  {
    id: "montrose_sanatorium",
    titlePrefix: "The Montrose Sanatorium Overdose",
    setting: "Montrose Psychiatric Institute, High Observation Wing",
    victimArchetype: {
      name: "Dr. Alistair Finch",
      age: 49,
      occupation: "Chief Consulting Neuropsychiatrist & Institute Director",
      bloodType: "AB-",
      causeOfDeath: "Acute Respiratory Arrest secondary to Chloral Hydrate and Morphine Intoxication",
      primaryInjury: "Severe pulmonary edema; needle puncture site on left antecubital fossa without typical medical dressing.",
      stomachContents: "Scotch whiskey and sedative syrup.",
      timeOfDeath: "01:20 EST",
      earliestTime: "01:00 EST",
      latestTime: "01:40 EST",
      toxicologySummary: "Lethal combination of 120 mg/L chloral hydrate and 0.4 mg/L morphine sulfate causing rapid medullary depression.",
      location: "Director's Private Consultation Suite",
      background: "Prepared to publish clinical findings on unauthorized experimental electro-shock trials on wealthy private patients."
    },
    weapons: [
      {
        id: "ev_weapon_vial_morphine",
        label: "Amber Glass Pharmaceutical Ampoule",
        type: "PHYSICAL",
        desc: "Empty 10ml ampoule of medicinal morphine sulfate from the restricted pharmacy safe.",
        forensicNotes: "Label serial number matches the locked institute dispensary inventory ledger."
      },
      {
        id: "ev_weapon_whiskey",
        label: "Heavy Crystal Decanter & Single-Malt Scotch",
        type: "BIO",
        desc: "Decanter on the director's credenza containing 40% alcohol laced with chloral hydrate syrup.",
        forensicNotes: "Residual syrup at the decanter stopper matches the sedative syrup formulation."
      }
    ],
    motives: [
      "Suppressing the whistleblower dossier on illegal experimental clinical trials",
      "Preventing immediate loss of medical license and criminal indictment",
      "Extorting institutional endowment funds before an international medical audit"
    ],
    reversalClueName: "Pharmacy Dispensary Controlled-Substance Keycard Log",
    reversalDiscovery: "The electrical pharmacy door contact registered access at 00:45 using an executive clearance fob, proving the night nurse on duty was locked out of the dispensary during the preparation window!",
    smokingGunName: "The Whistleblower Patient File #114",
    smokingGunDetail: "Found concealed beneath the false bottom of the culprit's leather diagnostic satchel, complete with altered prescription notes."
  }
];

// ── 12 Diverse Suspect Archetypes ──
interface SuspectTemplate {
  name: string;
  age: number;
  occ: string;
  personality: string;
  alibiTemplate: string;
  hiddenSecret: string;
  motiveTemplate: string;
  confessionTemplate: string;
  dialogues: {
    CALM: string[];
    DEFLECTING: string[];
    CORNERED: string[];
    BROKEN: string[];
  };
  bodyLanguage: Record<ComposureLevel, string>;
}

const SUSPECT_POOL: SuspectTemplate[] = [
  {
    name: "Desmond Sterling",
    age: 44,
    occ: "Disinherited Heir & Yacht Broker",
    personality: "Arrogant, calculating, easily agitated when financial privilege is questioned",
    alibiTemplate: "I was drinking dry martinis at the Metropolitan Club from 21:30 until closing. Half the staff will verify my presence.",
    hiddenSecret: "Siphoned over £180,000 from family offshore trust accounts to cover offshore gambling debts.",
    motiveTemplate: "Desperate to secure the family inheritance before the victim's revised trust fund cut him off permanently.",
    confessionTemplate: "Stop waving that document in my face! He was going to strip everything away—decades of inheritance reduced to pennies! Yes, I planned it. And I would do it again!",
    dialogues: {
      CALM: [
        "Detective, my schedule is an open ledger. Check the club register if you doubt my word.",
        "Arthur and I had our differences, certainly. But murder? That is a working-class solution.",
        "I suggest you look into the people who actually owed him money, rather than wasting your breath here."
      ],
      DEFLECTING: [
        "Are you insinuating something? Speak plainly or speak to my solicitor.",
        "Why aren't you interrogating the doctor? Everyone in town knows she had private meetings with him behind locked doors!",
        "You are reaching for shadows in the dark, Detective. You have zero evidence linking me to that room."
      ],
      CORNERED: [
        "Where did you unearth that paper?! That was locked in a private safe deposit box!",
        "The clock in the study was wrong! Anyone could have entered that wing before me!",
        "Stop twisting my words! You have no eyewitnesses, no proof, only circumstantial conjecture!"
      ],
      BROKEN: [
        "God... it was never supposed to get this far. He wouldn't listen to reason.",
        "He had the amended will right there on the mahogany desk... he looked me in the eye and laughed...",
        "Fine! Put the cuffs on. Just get me out from under these blinding interrogation lamps!"
      ]
    },
    bodyLanguage: {
      CALM: "*[Leans back comfortably in the chair; taps an expensive silver cigarette case with measured calm]*",
      DEFLECTING: "*[Straightens his tailored lapels abruptly; avoids direct eye contact while tapping his signet ring]*",
      CORNERED: "*[Hands grip the table edge until knuckles turn white; breathing becomes sharp and ragged]*",
      BROKEN: "*[Collapses forward with face buried in palms, voice cracking under the glare of the lamp]*"
    }
  },
  {
    name: "Dr. Evelyn Cross",
    age: 48,
    occ: "Consulting Biochemist & Personal Physician",
    personality: "Cold, clinical, hyper-precise, masks severe panic under medical jargon",
    alibiTemplate: "I was reviewing clinical toxicology monographs in the estate laboratory until midnight.",
    hiddenSecret: "Supplied unregistered experimental sedatives to the victim under the guise of sleep therapy.",
    motiveTemplate: "Terrified that an independent autopsy would expose her lethal medical malpractice and black-market pharmacology.",
    confessionTemplate: "You don't understand the science! He was already deteriorating! A few drops more in his glass simply accelerated what nature had already ordained!",
    dialogues: {
      CALM: [
        "As a medical professional, I deal in empirical facts. What specific clinical findings do you wish to discuss?",
        "My patient was suffering from chronic hypertension and insomnia. His demise is a physiological tragedy.",
        "The medications I prescribed were rigorously calibrated to the microgram."
      ],
      DEFLECTING: [
        "Your layman's interpretation of the autopsy sheet is embarrassingly flawed, Detective.",
        "Check the nursing logs! I wasn't the only one with access to the pharmacy cabinet.",
        "If you continue this slander without medical council present, I will file formal harassment charges."
      ],
      CORNERED: [
        "Where did you obtain that serum spectrometry graph?! That sample was supposed to be incinerated!",
        "The physiological half-life was miscalculated! It wasn't supposed to show in the femoral blood!",
        "You cannot hold me responsible for an idiosyncratic drug-drug interaction!"
      ],
      BROKEN: [
        "He was going to report me to the State Licensing Board... my entire career, thirty years of research, gone!",
        "I gave him the compound in the tea... I watched his pulse decelerate... I couldn't stop it...",
        "I need water... my chest... write whatever you want in your report. It's finished."
      ]
    },
    bodyLanguage: {
      CALM: "*[Sits with posture rigidly erect; fingers interlaced calmly over a leather notebook]*",
      DEFLECTING: "*[Removes tortoiseshell spectacles with clinical precision and polishes them with trembling cloth]*",
      CORNERED: "*[Eyes dart anxiously toward the interrogation room door; pulses visibly in the carotid artery]*",
      BROKEN: "*[Trembles uncontrollably; pushes chair back as if suffocating from the room's air]*"
    }
  },
  {
    name: "Julian Montgomery",
    age: 56,
    occ: "Senior Estate Solicitor & Legal Trustee",
    personality: "Nervous, meticulous, perpetually adjusting his spectacles, fiercely protective of financial ledgers",
    alibiTemplate: "I was alone in the library auditing the municipal bond portfolios until the police sirens began.",
    hiddenSecret: "Drafted an illicit back-dated power of attorney transferring control of the estate assets.",
    motiveTemplate: "Faced immediate disbarment and prison if the morning audit revealed his embezzlement of client trust funds.",
    confessionTemplate: "I had no choice! He was holding the audit report in his hands! He was going to phone the district attorney at daybreak! I had to silence him!",
    dialogues: {
      CALM: [
        "Detective, every transaction within this estate carries three counter-signatures and a certified seal.",
        "The deceased was an esteemed client of our firm for twenty-two years.",
        "I have full fiduciary responsibility to protect the privacy of these legal dossiers."
      ],
      DEFLECTING: [
        "The law does not operate on your detective intuition, sir. Where is your verified court subpoena?",
        "Anyone with access to the library key could have manipulated those ledger entries.",
        "You are confusing routine administrative discrepancies with criminal intent."
      ],
      CORNERED: [
        "That document was supposed to remain in the sealed archive! Who authorized this seizure?!",
        "The signature was authorized by verbal proxy! You cannot prove intent to defraud!",
        "I demand to speak with the senior partners immediately! This is an unlawful interrogation!"
      ],
      BROKEN: [
        "The shortfall was over half a million... I was trying to trade our way out before he noticed...",
        "He laughed in my face. He called me a pathetic petty thief. I lost control...",
        "Just make sure the press doesn't see me in handcuffs. Please."
      ]
    },
    bodyLanguage: {
      CALM: "*[Neatly aligns papers on the desk; adjusts fountain pen with deliberate, bureaucratic calm]*",
      DEFLECTING: "*[Tugs nervously at his starched collar; beads of sweat form along his receding hairline]*",
      CORNERED: "*[Spectacles slip down his nose; repeatedly dabs forehead with a crumpled monogrammed handkerchief]*",
      BROKEN: "*[Slumps forward with spectacles discarded on the floor, weeping into his trembling sleeves]*"
    }
  },
  {
    name: "Valerie Vance",
    age: 41,
    occ: "Estranged Sister & Modernist Art Dealer",
    personality: "Cynical, dramatic, chain-smoker, deeply resentful of the victim's inherited wealth",
    alibiTemplate: "I was having late dinner with gallery clients at the St. Regis dining room until 23:00.",
    hiddenSecret: "Purchased illegal forged consignments using collateral borrowed against the estate's gallery.",
    motiveTemplate: "Stood to inherit half the estate's private collection if the victim died before altering his bequest.",
    confessionTemplate: "He took everything our father built and treated me like a beggar! He deserved every agonizing breath he choked on!",
    dialogues: {
      CALM: [
        "If you want tears, Detective, look elsewhere. My dear brother and I despised each other openly.",
        "Check my dinner bill at the St. Regis. Three bottles of champagne and eight witnesses.",
        "I am an artist and an entrepreneur. I leave violent melodrama to the tabloids."
      ],
      DEFLECTING: [
        "Why are you badgering me? Go ask his pious secretary where she spent the witching hour.",
        "Family arguments are not capital offenses. Half of New York wishes their siblings dead.",
        "You think you're clever with your little notebook, don't you? You don't have a shred of proof."
      ],
      CORNERED: [
        "Where did you get that hotel registration slip?! That was private correspondence!",
        "I left the restaurant for twenty minutes! That doesn't prove I set foot in that study!",
        "You are manufacturing a case out of thin air because you're too incompetent to find the real killer!"
      ],
      BROKEN: [
        "He laughed at my paintings... he told me I was a leech living off his charity...",
        "I didn't want him to die in agony... I just wanted what was rightfully mine...",
        "Take me away. There is nothing left in this wretched house anyway."
      ]
    },
    bodyLanguage: {
      CALM: "*[Blows a thin stream of cigarette smoke toward the ceiling; crosses legs with nonchalant poise]*",
      DEFLECTING: "*[Ashes cigarette aggressively into the tray; taps manicured red nails against the table]*",
      CORNERED: "*[Cigarette burns down to the filter forgotten between trembling fingers; voice spikes in pitch]*",
      BROKEN: "*[Crushes cigarette into the metal table with shaking fingers; staring blankly into the shadows]*"
    }
  },
  {
    name: "Captain Thomas Vance",
    age: 53,
    occ: "Retired Naval Commander & Security Director",
    personality: "Stoic, disciplined, prone to sudden explosive defensiveness under forensic pressure",
    alibiTemplate: "I was conducting the routine perimeter patrol and inspection of the south gatehouse until midnight.",
    hiddenSecret: "Allowed unauthorized cargo crates through the private dock in exchange for cash envelopes.",
    motiveTemplate: "The victim discovered the unauthorized manifests and had drafted dismissal papers with naval intelligence.",
    confessionTemplate: "He was a civilian parasite threatening to destroy thirty years of honorable military service over shipping manifests! I neutralized the threat!",
    dialogues: {
      CALM: [
        "I run this estate security with naval discipline, Detective. Every incident is logged.",
        "The commander and I served our country with honor. I expect respect in this precinct.",
        "The south perimeter was fully secured. No intruder could breach the gatehouse without my notice."
      ],
      DEFLECTING: [
        "Do not question my service record, young man. I was handling heavy artillery while you were in school.",
        "If the gate log has an omission, it is a clerical oversight, not a conspiracy.",
        "You're wasting time questioning the officer who protected this family for a decade."
      ],
      CORNERED: [
        "Where did you get those gatehouse manifests?! Those are classified property of the estate!",
        "The security cameras on Pier 9 were malfunctioning! That proves nothing about my whereabouts!",
        "Stand down, Detective! You are crossing a very dangerous line with these baseless accusations!"
      ],
      BROKEN: [
        "He called me a common dockyard smuggler... after thirty years of guarding his wretched family...",
        "I used the service key... I took the weapon from the gun cabinet... it was over in thirty seconds...",
        "Inform my commanding officer that Commander Vance reports for arrest. I am done talking."
      ]
    },
    bodyLanguage: {
      CALM: "*[Stands at attention; arms clasped firmly behind his back with military posture]*",
      DEFLECTING: "*[Jaws clench visibly; square shoulders stiffen as his chest heaves with restrained irritation]*",
      CORNERED: "*[Leans forward across the table, looming menacingly with veins pulsing along his neck]*",
      BROKEN: "*[Lowers his chin onto his chest; shoulders slump as the military facade crumbles into defeat]*"
    }
  },
  {
    name: "Clara Holloway",
    age: 38,
    occ: "Private Confidential Secretary & Stenographer",
    personality: "Quiet, observant, hyper-alert, holds deep private leverage over the entire household",
    alibiTemplate: "I was in the transcription annex transcribing dictated dictaphone memos until 22:30.",
    hiddenSecret: "Kept duplicate audio wiretap recordings of all confidential conversations in her private apartment.",
    motiveTemplate: "Discovered the victim was planning to frame her for corporate tax evasion as a disposable scapegoat.",
    confessionTemplate: "He used people like carbon paper! Typed on them, discarded them, burned them! I knew his plan—he was going to blame me for his crimes! I struck first!",
    dialogues: {
      CALM: [
        "I have documented every telephone call and visitor log for the past seven years, Detective.",
        "Mr. Blackwood was a demanding employer, but precision was his hallmark.",
        "The transcription tapes are filed chronologically in the metal cabinet."
      ],
      DEFLECTING: [
        "I merely type what I am dictated. I do not question the moral character of my employer's guests.",
        "If you want to know about the wiretap tapes, ask the security chief who installed the switchboard.",
        "I was an employee, not an accomplice. You are harassing the only cooperative witness you have."
      ],
      CORNERED: [
        "How did you find that cassette tape?! That was marked confidential personal property!",
        "The transcription stamp has an automated clock! That does not mean I was in the inner office!",
        "He was going to send me to prison for his offshore shell company! He had the papers drawn up!"
      ],
      BROKEN: [
        "He smiled as he dictated the letter blaming me for the missing funds... he handed it to me to type...",
        "I put the vial in the decanter before I left the room... I couldn't go to prison for his sins...",
        "Take the notebook. Everything is in there. Every secret this foul house ever had."
      ]
    },
    bodyLanguage: {
      CALM: "*[Keeps hands folded neatly in her lap; eyes watchful, observing every pen stroke]*",
      DEFLECTING: "*[Fingers twitch instinctively as if typing on an imaginary stenotype machine; lips press thin]*",
      CORNERED: "*[Breathes quickly; clutching her leather handbag to her chest like a protective shield]*",
      BROKEN: "*[Releases the handbag; tears trace down her cheeks as she stares at her ink-stained fingers]*"
    }
  }
];

// ── Master Procedural Case Generator ──
export function generateCase(seed?: number): CaseGraph {
  const caseSeed = typeof seed === "number" ? seed : Math.floor(Math.random() * 900000) + 100000;
  const prng = createPRNG(caseSeed);

  // 1. Pick Theme from the 8 Atmospheric Archetypes
  const theme = pickRandom(prng, CASE_THEMES);
  const victimData = theme.victimArchetype;

  // 2. Select 3 Distinct Suspects from the 6 Deep Archetypes
  const shuffledSuspects = shuffle(prng, SUSPECT_POOL).slice(0, 3);
  const culpritTemplate = shuffledSuspects[0];
  const redHerringTemplate = shuffledSuspects[1];
  const accompliceTemplate = shuffledSuspects[2];

  const culpritId = "suspect_culprit";
  const redHerringId = "suspect_red_herring";
  const accompliceId = "suspect_accomplice";

  const selectedWeapon = theme.weapons[0];
  const secondaryWeapon = theme.weapons[1];
  const primaryMotive = theme.motives[0];
  const secondaryMotive = theme.motives[1];

  // 3. Evidence Identifiers
  const clueIdContradictCulprit = "ev_forensic_smoking_gun";
  const clueIdContradictRedHerring = "ev_alibi_refutation";
  const clueIdContradictAccomplice = "ev_blackmail_ledger";
  const clueIdReversal = "ev_toxicology_reversal";
  const clueIdUVHidden = "ev_uv_latent_print";
  const clueIdWiretap = "ev_audio_wiretap";

  // 4. Construct 3-Act Forensic Evidence Network
  const evidenceNodes: EvidenceNode[] = [
    // ── ACT 1: The Hook / Initial Crime Scene Clues ──
    {
      id: "ev_autopsy_prelim",
      label: `Official Autopsy Report: ${victimData.name}`,
      title: `Official Autopsy Report: ${victimData.name}`,
      type: "BIO",
      category: "autopsy",
      description: `Comprehensive forensic post-mortem performed on ${victimData.name} (${victimData.age}, ${victimData.occupation}). Cause: ${victimData.causeOfDeath}.`,
      summary: `Pathologist notes preliminary estimated time of death between ${victimData.earliestTime} and ${victimData.latestTime}.`,
      fullForensicAnalysis: `PATHOLOGIST NOTES: ${victimData.primaryInjury}. Gastric contents: ${victimData.stomachContents}. Lividity patterns confirm victim was seated and remained undisturbed post-mortem. Blood Type: ${victimData.bloodType}.`,
      fullAnalysis: `PATHOLOGIST NOTES: ${victimData.primaryInjury}. Gastric contents: ${victimData.stomachContents}. Lividity patterns confirm victim was seated and remained undisturbed post-mortem. Blood Type: ${victimData.bloodType}.`,
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
      label: "Crime Scene 8x10 Glossy & Staged Artifacts",
      title: "Crime Scene 8x10 Glossy & Staged Artifacts",
      type: "PHYSICAL",
      category: "photograph",
      description: `High-contrast monochrome photograph of ${victimData.name} slumped in ${theme.setting}.`,
      summary: "Shows victim's personal effects, spilled liquid, and a monocle resting unnaturally on the floorboards.",
      fullForensicAnalysis: `Careful examination reveals that the desk timepiece was manually stopped at ${victimData.earliestTime} by jarring the balance wheel—a deliberate timestamp manipulation to frame ${redHerringTemplate.name}.`,
      fullAnalysis: `Careful examination reveals that the desk timepiece was manually stopped at ${victimData.earliestTime} by jarring the balance wheel—a deliberate timestamp manipulation to frame ${redHerringTemplate.name}.`,
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
      summary: `Secured in close proximity to the victim. Subjected to preliminary chemical swabs.`,
      fullForensicAnalysis: `CRIME LAB NOTES: ${selectedWeapon.forensicNotes} Trace epithelial cells recovered along the handle match the victim's blood type.`,
      fullAnalysis: `CRIME LAB NOTES: ${selectedWeapon.forensicNotes} Trace epithelial cells recovered along the handle match the victim's blood type.`,
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
      label: `Crumpled Transport Receipt & Stubs: ${redHerringTemplate.name}`,
      title: `Crumpled Transport Receipt & Stubs: ${redHerringTemplate.name}`,
      type: "DOCUMENT",
      category: "document",
      description: `Recovered from the entryway ashcan. Dated the exact evening of the murder.`,
      summary: `Timestamps place ${redHerringTemplate.name}'s arrival earlier than stated in initial interview.`,
      fullForensicAnalysis: `Carbon test confirms ${redHerringTemplate.name}'s presence at the gates. However, exit timestamp logs verify they departed the grounds at 22:15—well before the fatal window. They were framed by the true killer!`,
      fullAnalysis: `Carbon test confirms ${redHerringTemplate.name}'s presence at the gates. However, exit timestamp logs verify they departed the grounds at 22:15—well before the fatal window. They were framed by the true killer!`,
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

    // ── ACT 2: The Reversal / Forensic Deep-Dive ──
    {
      id: clueIdReversal,
      label: theme.reversalClueName,
      title: theme.reversalClueName,
      type: "BIO",
      category: "toxicology",
      description: `Lab analysis of victim's biological tissue and environmental readings.`,
      summary: victimData.toxicologySummary,
      fullForensicAnalysis: `ACT 2 REVERSAL FINDINGS: ${theme.reversalDiscovery} This conclusively invalidates the initial theory and proves ${redHerringTemplate.name} is entirely innocent of the murder!`,
      fullAnalysis: `ACT 2 REVERSAL FINDINGS: ${theme.reversalDiscovery} This conclusively invalidates the initial theory and proves ${redHerringTemplate.name} is entirely innocent of the murder!`,
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
      label: "Magnetic Tape Reel: Switchboard Telephony Intercept",
      title: "Magnetic Tape Reel: Switchboard Telephony Intercept",
      type: "AUDIO",
      category: "wiretap_transcript",
      description: `A 1/4-inch magnetic tape recording intercepted via private switchboard tap at 21:40 on the night of the crime.`,
      summary: "Two tense voices arguing over an imminent disclosure and missing funds.",
      fullForensicAnalysis: `Spectral audio analysis matches the unique vocal frequency and cadence to ${culpritTemplate.name} discussing 'ensuring ${victimData.name} does not meet the courier at dawn'.`,
      fullAnalysis: `Spectral audio analysis matches the unique vocal frequency and cadence to ${culpritTemplate.name} discussing 'ensuring ${victimData.name} does not meet the courier at dawn'.`,
      audioTranscript: `[VOICE A]: "He's upstairs right now drafting the revocation. If that courier leaves at dawn, we are both ruined."\n[VOICE B]: "The courier won't receive anything. I have prepared the instrument. Just ensure the staff is cleared from the corridor."`,
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
      label: `Encrypted Ledger & Embezzlement Slips: ${accompliceTemplate.name}`,
      title: `Encrypted Ledger & Embezzlement Slips: ${accompliceTemplate.name}`,
      type: "DOCUMENT",
      category: "document",
      description: "Recovered from behind the wall safe in the guest annex.",
      summary: "Contains systematic records of forged vouchers and siphoned bonds.",
      fullForensicAnalysis: `Proves ${accompliceTemplate.name} was blackmailed by the victim, establishing a strong motive for secondary forgery, but alibi logs confirm they were destroying papers in the basement during the actual homicide window.`,
      fullAnalysis: `Proves ${accompliceTemplate.name} was blackmailed by the victim, establishing a strong motive for secondary forgery, but alibi logs confirm they were destroying papers in the basement during the actual homicide window.`,
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

    // ── ACT 3: The Climax / Smoking Gun Proof ──
    {
      id: clueIdUVHidden,
      label: "Crime Scene Surface: UV Latent Fingerprint Whorl",
      title: "Crime Scene Surface: UV Latent Fingerprint Whorl",
      type: "UV_HIDDEN",
      category: "fingerprint",
      description: "Positioned directly before the victim's primary desk seating area.",
      summary: "Appears clean to the naked eye under conventional tungsten lighting.",
      fullForensicAnalysis: `Under 365nm UV Blacklight illumination, latent luminescent chemical fingerprints appear along the edge, matching ${culpritTemplate.name}'s right index whorl pattern mixed with chemical residue.`,
      fullAnalysis: `Under 365nm UV Blacklight illumination, latent luminescent chemical fingerprints appear along the edge, matching ${culpritTemplate.name}'s right index whorl pattern mixed with chemical residue.`,
      hiddenUVDetails: `[UV 365nm ACTIVE]: Luminescent chemical residue reveals latent right-hand fingerprint whorls matching Culprit ID #${culpritId} (${culpritTemplate.name}).`,
      hiddenDetail: `[UV 365nm ACTIVE]: Luminescent chemical residue reveals latent right-hand fingerprint whorls matching Culprit ID #${culpritId} (${culpritTemplate.name}).`,
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
      label: theme.smokingGunName,
      title: theme.smokingGunName,
      type: "PHYSICAL",
      category: "weapon",
      description: "Recovered during secondary search of the immediate crime scene perimeter.",
      summary: "Contains trace physical evidence proving direct contact during the homicide.",
      fullForensicAnalysis: `FATAL CONTRADICTION: ${theme.smokingGunDetail} Only ${culpritTemplate.name} possessed access to this item at the exact moment of death, completely shattering their claimed alibi!`,
      fullAnalysis: `FATAL CONTRADICTION: ${theme.smokingGunDetail} Only ${culpritTemplate.name} possessed access to this item at the exact moment of death, completely shattering their claimed alibi!`,
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

  // 5. Construct Suspect Archetypes & Composure Machines
  const suspects: SuspectArchetype[] = [
    // 1. True Culprit
    {
      id: culpritId,
      name: culpritTemplate.name,
      age: culpritTemplate.age,
      occupation: culpritTemplate.occ,
      role: culpritTemplate.occ,
      personality: culpritTemplate.personality,
      composure: "CALM",
      composureLevel: "CALM",
      stressLevel: 15,
      alibiStatement: culpritTemplate.alibiTemplate,
      alibi: culpritTemplate.alibiTemplate,
      hiddenSecret: culpritTemplate.hiddenSecret,
      motive: primaryMotive,
      isGuilty: true,
      contradictionClueId: clueIdContradictCulprit,
      contradictionEvidenceId: clueIdContradictCulprit,
      confessionDialogue: culpritTemplate.confessionTemplate,
      dialogueByComposure: culpritTemplate.dialogues,
      bodyLanguageCues: culpritTemplate.bodyLanguage,
      boardPosition: { x: 25, y: 30 },
      relationships: {
        [redHerringId]: "Framed them deliberately using planted receipts and staged entry timestamps.",
        [accompliceId]: "Manipulated them into destroying paper trails without revealing the murder plan."
      }
    },
    // 2. Framed Red Herring
    {
      id: redHerringId,
      name: redHerringTemplate.name,
      age: redHerringTemplate.age,
      occupation: redHerringTemplate.occ,
      role: redHerringTemplate.occ,
      personality: redHerringTemplate.personality,
      composure: "CALM",
      composureLevel: "CALM",
      stressLevel: 35,
      alibiStatement: redHerringTemplate.alibiTemplate,
      alibi: redHerringTemplate.alibiTemplate,
      hiddenSecret: redHerringTemplate.hiddenSecret,
      motive: secondaryMotive,
      isGuilty: false,
      contradictionClueId: clueIdContradictRedHerring,
      contradictionEvidenceId: clueIdContradictRedHerring,
      confessionDialogue: `I didn't kill anyone! Yes, I was there to argue with him, but he was alive when I walked out through the north gate! You have to believe me!`,
      dialogueByComposure: redHerringTemplate.dialogues,
      bodyLanguageCues: redHerringTemplate.bodyLanguage,
      boardPosition: { x: 50, y: 30 },
      relationships: {
        [culpritId]: "Deeply suspicious of their financial maneuvers, but unaware of the trap laid for them.",
        [accompliceId]: "Met briefly in the foyer before departing the estate."
      }
    },
    // 3. Blackmailed / Compromised Accomplice
    {
      id: accompliceId,
      name: accompliceTemplate.name,
      age: accompliceTemplate.age,
      occupation: accompliceTemplate.occ,
      role: accompliceTemplate.occ,
      personality: accompliceTemplate.personality,
      composure: "CALM",
      composureLevel: "CALM",
      stressLevel: 25,
      alibiStatement: accompliceTemplate.alibiTemplate,
      alibi: accompliceTemplate.alibiTemplate,
      hiddenSecret: accompliceTemplate.hiddenSecret,
      motive: "Silencing a blackmailer before document seizure",
      isGuilty: false,
      contradictionClueId: clueIdContradictAccomplice,
      contradictionEvidenceId: clueIdContradictAccomplice,
      confessionDialogue: `I only burned the ledger sheets! He swore nobody would get hurt! I never wanted anyone dead!`,
      dialogueByComposure: accompliceTemplate.dialogues,
      bodyLanguageCues: accompliceTemplate.bodyLanguage,
      boardPosition: { x: 75, y: 30 },
      relationships: {
        [culpritId]: "Was coerced into destroying financial documentation in exchange for debt forgiveness.",
        [redHerringId]: "Saw them leave the estate twenty minutes before the sirens started."
      }
    }
  ];

  // 6. Detailed Chronological Timeline
  const timeline: ChronologyEvent[] = [
    {
      id: "ev_time_1",
      timestamp: "21:00 EST",
      time: "21:00 EST",
      event: `${victimData.name} retreats to ${theme.setting} with confidential legal documents.`,
      description: `${victimData.name} retreats to ${theme.setting} with confidential legal documents.`,
      isCrimeTime: false,
      involvedSuspectIds: [culpritId, accompliceId]
    },
    {
      id: "ev_time_2",
      timestamp: "21:30 EST",
      time: "21:30 EST",
      event: `${redHerringTemplate.name} arrives at the estate gates for a heated private confrontation.`,
      description: `${redHerringTemplate.name} arrives at the estate gates for a heated private confrontation.`,
      isCrimeTime: false,
      involvedSuspectIds: [redHerringId]
    },
    {
      id: "ev_time_3",
      timestamp: "22:15 EST",
      time: "22:15 EST",
      event: `${redHerringTemplate.name} departs the premises through the north turnstile (verified by gate log).`,
      description: `${redHerringTemplate.name} departs the premises through the north turnstile (verified by gate log).`,
      isCrimeTime: false,
      involvedSuspectIds: [redHerringId]
    },
    {
      id: "ev_time_4",
      timestamp: victimData.timeOfDeath,
      time: victimData.timeOfDeath,
      event: `ESTIMATED FATAL STRIKE: The fatal trauma occurs inside ${theme.setting}.`,
      description: `ESTIMATED FATAL STRIKE: The fatal trauma occurs inside ${theme.setting}.`,
      isCrimeTime: true,
      isCrucialContradictionPoint: true,
      involvedSuspectIds: [culpritId]
    },
    {
      id: "ev_time_5",
      timestamp: "23:45 EST",
      time: "23:45 EST",
      event: `First dispatch patrol officers arrive and secure the crime scene perimeter.`,
      description: `First dispatch patrol officers arrive and secure the crime scene perimeter.`,
      isCrimeTime: false
    }
  ];

  // 7. Ground Truth Secret Narrative
  const secretTruth: SecretTruth = {
    culpritId,
    killerId: culpritId,
    murderWeaponClueId: selectedWeapon.id,
    weaponEvidenceId: selectedWeapon.id,
    murderWeaponEvidenceId: selectedWeapon.id,
    motiveSummary: primaryMotive,
    motiveIndex: 0,
    primaryMotive,
    fatalContradictionSummary: `Forensic analysis proves ${culpritTemplate.name} was inside ${theme.setting} during the fatal strike at ${victimData.timeOfDeath}, leaving fingerprint and chemical traces on the murder weapon.`,
    act1FalseLeadSuspectId: redHerringId,
    act2ReversalClueId: clueIdReversal,
    act3FinalContradictionClueId: clueIdContradictCulprit,
    fullNarrativeChronicle: `THE TRUTH OF CASE #${caseSeed} (${theme.titlePrefix}):\n\n` +
      `On the night of the crime, ${victimData.name} was scheduled to execute legal documents that would permanently expose financial embezzlement. ` +
      `Anticipating this disclosure, ${culpritTemplate.name} coordinated a deliberate scheme: using ${redHerringTemplate.name}'s known dispute with the victim as cover, ` +
      `they staged false transport receipts and manipulated the study timepiece to frame ${redHerringTemplate.name}. ` +
      `In reality, ${redHerringTemplate.name} had departed the grounds at 22:15. ` +
      `During the true fatal window (${victimData.timeOfDeath}), ${culpritTemplate.name} utilized ${selectedWeapon.label} to eliminate ${victimData.name}, ` +
      `leaving behind microscopic chemical and latent fingerprint traces illuminated under 365nm UV blacklight. ` +
      `Justice is served through methodical forensic proof.`,
    fullNarrative: `THE TRUTH OF CASE #${caseSeed}: ${culpritTemplate.name} committed the homicide using ${selectedWeapon.label} driven by ${primaryMotive}.`,
    fullCrimeNarrative: `THE TRUTH OF CASE #${caseSeed}: ${culpritTemplate.name} committed the homicide using ${selectedWeapon.label} driven by ${primaryMotive}.`
  };

  const caseNumber = `VM-${caseSeed}`;
  const caseTitle = `${theme.titlePrefix} (Case #${caseNumber})`;

  return {
    id: `case_${caseSeed}`,
    seed: caseSeed,
    caseNumber,
    title: caseTitle,
    date: "NOVEMBER 14, 1974",
    crimeSceneLocation: theme.setting,
    location: theme.setting,
    currentAct: "act1_hook",
    act: "act1_hook",
    victim: {
      id: "victim_profile",
      name: victimData.name,
      age: victimData.age,
      occupation: victimData.occupation,
      bloodType: victimData.bloodType,
      timeOfDeath: victimData.timeOfDeath,
      causeOfDeath: victimData.causeOfDeath,
      locationFound: theme.setting,
      location: theme.setting,
      toxicologyNotes: {
        substancesDetected: [victimData.causeOfDeath],
        bloodAlcoholLevel: 0.04,
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
        pathologistNotes: victimData.toxicologySummary
      },
      backgroundDossier: victimData.background,
      autopsySummary: victimData.primaryInjury,
      backgroundNotes: victimData.background
    },
    suspects,
    evidenceNodes,
    evidence: evidenceNodes,
    timeline,
    narrativeActs: {
      act1_hook: `ACT I — THE HOOK: Preliminary investigation of ${theme.setting}. Circumstantial evidence and timestamps point suspicion directly toward ${redHerringTemplate.name}.`,
      act2_reversal: `ACT II — THE REVERSAL: Toxicology chromatography and switchboard wiretaps shatter the initial theory, fully exonerating ${redHerringTemplate.name} and exposing an inside conspiracy.`,
      act3_climax: `ACT III — THE RECKONING: UV 365nm blacklight inspection and smoking gun physical proof corner ${culpritTemplate.name} into an unassailable breakdown.`
    },
    actSummaries: {
      act1_hook: `The body of ${victimData.name} lies cold in ${theme.setting}. Early clues point toward ${redHerringTemplate.name}.`,
      act2_reversal: `A forensic breakthrough clears ${redHerringTemplate.name}. A deeper shadow emerges.`,
      act3_climax: `Assemble the definitive evidence and confront the true architect of the crime.`
    },
    secretTruth,
    solution: secretTruth,
    redStrings: [],
    createdAt: new Date().toISOString()
  };
}
