import type {
  DarkPatternType,
  PatternFinding,
  RiskLevel,
  ScoreBreakdown,
} from "@/lib/uxray/types";

export const PATTERN_WEIGHTS: Record<DarkPatternType, number> = {
  "Fake Urgency": 25,
  "Hidden Unsubscribe": 25,
  "Confirm Shaming": 20,
  "Forced Signup": 20,
  "Misleading CTA Hierarchy": 15,
};

export function calculateUxRayScore(findings: PatternFinding[]) {
  const breakdown = Object.keys(PATTERN_WEIGHTS).reduce((accumulator, key) => {
    const patternType = key as DarkPatternType;
    accumulator[patternType] = 0;
    return accumulator;
  }, {} as ScoreBreakdown);

  const strongestFindingByPattern = new Map<DarkPatternType, PatternFinding>();

  for (const finding of findings) {
    const current = strongestFindingByPattern.get(finding.patternType);

    if (!current || getSeverityWeight(finding) > getSeverityWeight(current)) {
      strongestFindingByPattern.set(finding.patternType, finding);
    }
  }

  for (const [patternType, finding] of strongestFindingByPattern.entries()) {
    breakdown[patternType] = calculatePatternPoints(patternType, finding);
  }

  const score = Math.min(
    100,
    Object.values(breakdown).reduce((total, value) => total + value, 0)
  );

  return {
    score,
    riskLevel: getRiskLevel(score),
    breakdown,
  };
}

function calculatePatternPoints(patternType: DarkPatternType, finding: PatternFinding) {
  const baseWeight = PATTERN_WEIGHTS[patternType];
  const evidenceBoost = Math.min(
    0.09,
    Math.max(0, finding.elementIds.length - 1) * 0.03
  );
  const explanationBoost = finding.explanation.length > 90 ? 0.03 : 0;
  const multiplier = Math.min(
    1,
    getSeverityWeight(finding) + evidenceBoost + explanationBoost
  );

  return Math.round(baseWeight * multiplier);
}

function getSeverityWeight(finding: PatternFinding) {
  switch (finding.severity) {
    case "high":
      return 0.77;
    case "moderate":
      return 0.62;
    case "low":
      return 0.38;
    default:
      return 0;
  }
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) {
    return "Low";
  }

  if (score <= 60) {
    return "Medium";
  }

  return "High";
}
