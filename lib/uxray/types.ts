export const DARK_PATTERN_TYPES = [
  "Fake Urgency",
  "Confirm Shaming",
  "Forced Signup",
  "Hidden Unsubscribe",
  "Misleading CTA Hierarchy",
] as const;

export const SEVERITY_LEVELS = ["low", "moderate", "high"] as const;
export const RISK_LEVELS = ["Low", "Medium", "High"] as const;

export type DarkPatternType = (typeof DARK_PATTERN_TYPES)[number];
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];

export type ElementKind =
  | "text"
  | "button"
  | "link"
  | "input"
  | "form"
  | "modal"
  | "timer"
  | "image";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ExtractedElement = {
  id: string;
  kind: ElementKind;
  text: string;
  role?: string;
  selector?: string;
  isVisible?: boolean;
  bounds?: BoundingBox;
  styles?: {
    fontSize?: number;
    opacity?: number;
    prominentColor?: string;
    fontWeight?: number;
    isPrimary?: boolean;
    isMuted?: boolean;
  };
  metadata?: Record<string, string | number | boolean | null>;
};

export type ExtractedPage = {
  url: string;
  title: string;
  screenshot: {
    src: string;
    width: number;
    height: number;
  };
  elements: ExtractedElement[];
};

export type PatternFinding = {
  id: string;
  patternType: DarkPatternType;
  severity: SeverityLevel;
  explanation: string;
  elementIds: string[];
};

export type ScoreBreakdown = Record<DarkPatternType, number>;

export type ScanMeta = {
  extractionMode: "playwright" | "fixture";
};

export type ScanResult = {
  url: string;
  title: string;
  findings: PatternFinding[];
  score: number;
  riskLevel: RiskLevel;
  breakdown: ScoreBreakdown;
  screenshot: ExtractedPage["screenshot"];
  elements: ExtractedElement[];
  meta: ScanMeta;
};
