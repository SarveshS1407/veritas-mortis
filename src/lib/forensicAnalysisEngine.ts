import { EvidenceNode, CaseGraph, EvidenceType } from "@/types/caseEngine";

export type LabAnalysisType =
  | "SPECTROMETRY"
  | "BALLISTICS"
  | "UV_MINUTIAE"
  | "TOXICOLOGY_SERUM"
  | "BLOOD_SPATTER_PATTERN"
  | "DOCUMENT_FORENSICS";

export interface MinutiaePoint {
  x: number;
  y: number;
  type: "bifurcation" | "ridge_ending" | "island" | "delta";
  description: string;
}

export interface LabAnalysisReport {
  evidenceId: string;
  evidenceLabel: string;
  analysisType: LabAnalysisType;
  timestamp: string;
  examinerId: string;
  confidenceScore: number; // 0 - 100
  microscopicFindings: string;
  chemicalCompoundsDetected?: string[];
  striationMatchScore?: number;
  minutiaePoints?: MinutiaePoint[];
  forensicConclusion: string;
  revealedSuspectIds: string[];
  exoneratedSuspectIds: string[];
  isContradictionKey: boolean;
}

/**
 * VERITAS MORTIS — Forensic Laboratory Analysis Engine
 *
 * Processes evidence tokens submitted to the forensic lab, performing
 * spectrophotometry, ballistic comparison microscope striation matching,
 * fingerprint minutiae identification, and toxicological metabolic decomposition analysis.
 */
export class ForensicAnalysisEngine {
  public static analyzeEvidence(
    evidence: EvidenceNode,
    analysisType: LabAnalysisType,
    caseGraph: CaseGraph
  ): LabAnalysisReport {
    const timestamp = new Date().toISOString();
    const examinerId = "LAB-CRIM-42";
    const culpritId = caseGraph.secretTruth.culpritId;

    switch (analysisType) {
      case "SPECTROMETRY": {
        const hasChemical = evidence.type === "BIO" || evidence.category === "toxicology" || evidence.category === "weapon";
        const compounds = hasChemical
          ? caseGraph.victim.toxicologyNotes.substancesDetected || ["Potassium Cyanide", "Diazepam"]
          : ["Cellulose Fibers", "Carbon Black Pigment"];

        return {
          evidenceId: evidence.id,
          evidenceLabel: evidence.label || evidence.title || "Evidence Sample",
          analysisType: "SPECTROMETRY",
          timestamp,
          examinerId,
          confidenceScore: 98,
          microscopicFindings: `Infrared absorption peaks identified at 2080 cm⁻¹ and 1650 cm⁻¹. Molecular mass spectrometry confirms active compound traces consistent with the lethal vector.`,
          chemicalCompoundsDetected: compounds,
          forensicConclusion: `Spectrometric analysis establishes direct chemical correspondence with the fatal toxin administered to ${caseGraph.victim.name}.`,
          revealedSuspectIds: evidence.implicatesSuspectIds || evidence.implicates || [],
          exoneratedSuspectIds: evidence.exoneratesSuspectIds || evidence.exonerates || [],
          isContradictionKey: evidence.id === caseGraph.secretTruth.murderWeaponClueId || evidence.id === caseGraph.secretTruth.act3FinalContradictionClueId,
        };
      }

      case "BALLISTICS": {
        const isWeapon = evidence.category === "weapon" || evidence.type === "PHYSICAL";
        const striationScore = isWeapon ? 94 : 45;

        return {
          evidenceId: evidence.id,
          evidenceLabel: evidence.label || evidence.title || "Ballistic Sample",
          analysisType: "BALLISTICS",
          timestamp,
          examinerId,
          confidenceScore: striationScore,
          striationMatchScore: striationScore,
          microscopicFindings: `Comparison microscope inspection at 40x magnification reveals 6 right-hand lands and grooves. Land width: 1.25mm; breech face impression marks indicate precise alignment.`,
          forensicConclusion: `Ballistic striations and firing-pin indentation match the class and individual characteristics of the murder instrument.`,
          revealedSuspectIds: [culpritId],
          exoneratedSuspectIds: [],
          isContradictionKey: evidence.id === caseGraph.secretTruth.murderWeaponClueId,
        };
      }

      case "UV_MINUTIAE": {
        const minutiae: MinutiaePoint[] = [
          { x: 124, y: 88, type: "bifurcation", description: "Primary right-hand thumb whorl bifurcation at core delta" },
          { x: 156, y: 112, type: "ridge_ending", description: "Sub-core terminating ridge with trace chemical coating" },
          { x: 92, y: 140, type: "island", description: "Luminescent island defect matching suspect palm friction ridge" },
        ];

        return {
          evidenceId: evidence.id,
          evidenceLabel: evidence.label || evidence.title || "Latent Print Specimen",
          analysisType: "UV_MINUTIAE",
          timestamp,
          examinerId,
          confidenceScore: 96,
          minutiaePoints: minutiae,
          microscopicFindings: `Shortwave 365nm UV excitation produces intense fluorescence along ridge crests. 16 distinct minutiae points verified without distortion.`,
          forensicConclusion: `Latent fingerprint lift conclusively matches the right index print of suspect ${culpritId}, corroborating physical presence at the point of crime scene staging.`,
          revealedSuspectIds: [culpritId],
          exoneratedSuspectIds: [],
          isContradictionKey: Boolean(evidence.hiddenUVDetails || evidence.hiddenDetail),
        };
      }

      case "TOXICOLOGY_SERUM": {
        return {
          evidenceId: evidence.id,
          evidenceLabel: evidence.label || evidence.title || "Toxicology Vial",
          analysisType: "TOXICOLOGY_SERUM",
          timestamp,
          examinerId,
          confidenceScore: 99,
          microscopicFindings: `Blood serum chromatography demonstrates peak metabolic absorption rate at 21:30. Inactive gastric metabolites confirm poison was ingested 75 minutes prior to cardiac arrest.`,
          chemicalCompoundsDetected: caseGraph.victim.toxicologyNotes.substancesDetected,
          forensicConclusion: `The physiological absorption timeline invalidates the initial time-of-death conjecture, proving the victim was incapacitated prior to the secondary suspect's arrival.`,
          revealedSuspectIds: [culpritId],
          exoneratedSuspectIds: evidence.exoneratesSuspectIds || [caseGraph.secretTruth.act1FalseLeadSuspectId || ""],
          isContradictionKey: evidence.id === caseGraph.secretTruth.act2ReversalClueId,
        };
      }

      case "BLOOD_SPATTER_PATTERN": {
        return {
          evidenceId: evidence.id,
          evidenceLabel: evidence.label || evidence.title || "Blood Spatter Cast-off",
          analysisType: "BLOOD_SPATTER_PATTERN",
          timestamp,
          examinerId,
          confidenceScore: 92,
          microscopicFindings: `High-velocity misting (<1mm diameter) with radiating linear cast-off angles at 42° relative to the mahogany desk plane. Void pattern indicates an assailant standing 2 feet directly opposite.`,
          forensicConclusion: `The point-of-origin trigonometric convergence indicates the victim was seated and motionless when trauma was delivered.`,
          revealedSuspectIds: evidence.implicatesSuspectIds || [],
          exoneratedSuspectIds: [],
          isContradictionKey: false,
        };
      }

      case "DOCUMENT_FORENSICS":
      default: {
        return {
          evidenceId: evidence.id,
          evidenceLabel: evidence.label || evidence.title || "Documentary Evidence",
          analysisType: "DOCUMENT_FORENSICS",
          timestamp,
          examinerId,
          confidenceScore: 95,
          microscopicFindings: `Electrostatic Detection Apparatus (ESDA) reveals indented latent impressions on the paper fiber. Iron-gall ink chromatogram matches the monogrammed reservoir ink.`,
          forensicConclusion: `The signature indentation and paper fiber aging confirm the document was executed on the evening of the murder.`,
          revealedSuspectIds: evidence.implicatesSuspectIds || [],
          exoneratedSuspectIds: evidence.exoneratesSuspectIds || [],
          isContradictionKey: Boolean(evidence.contradictsSuspectId),
        };
      }
    }
  }
}
