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

  const detectedPatterns = new Set(findings.map((finding) => finding.patternType));

  for (const patternType of detectedPatterns) {
    breakdown[patternType] = PATTERN_WEIGHTS[patternType];
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

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) {
    return "Low";
  }

  if (score <= 60) {
    return "Medium";
  }

  return "High";
}
