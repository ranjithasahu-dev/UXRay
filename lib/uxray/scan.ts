import { analyzeDarkPatterns } from "@/lib/uxray/analysis";
import { getGenericFixture, getVoyagoFixture } from "@/lib/uxray/fixtures";
import { calculateUxRayScore } from "@/lib/uxray/scoring";
import type { ExtractedPage, ScanResult } from "@/lib/uxray/types";

export type ScanInput = {
  url: string;
  extractedPage?: ExtractedPage;
};

function getDemoExtraction(url: string) {
  if (/voyago/i.test(url)) {
    return getVoyagoFixture(url);
  }

  return getGenericFixture(url);
}

export async function runUxRayScan(input: ScanInput): Promise<ScanResult> {
  const page = input.extractedPage ?? getDemoExtraction(input.url);
  const findings = await analyzeDarkPatterns(page);
  const { score, riskLevel, breakdown } = calculateUxRayScore(findings);

  return {
    url: page.url,
    title: page.title,
    findings,
    score,
    riskLevel,
    breakdown,
    screenshot: page.screenshot,
    elements: page.elements,
  };
}
