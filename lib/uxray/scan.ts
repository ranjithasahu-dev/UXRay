import { analyzeDarkPatterns } from "@/lib/uxray/analysis";
import { extractPageWithPlaywright } from "@/lib/uxray/extractor";
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
  const extractionResult = await getPageForScan(input);
  const page = extractionResult.page;
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
    meta: {
      extractionMode: extractionResult.extractionMode,
    },
  };
}

async function getPageForScan(input: ScanInput) {
  if (input.extractedPage) {
    return {
      extractionMode: "fixture" as const,
      page: input.extractedPage,
    };
  }

  if (/voyago-demo\.local/i.test(input.url)) {
    return {
      extractionMode: "fixture" as const,
      page: getVoyagoFixture(input.url),
    };
  }

  try {
    return await extractPageWithPlaywright(input.url);
  } catch {
    return {
      extractionMode: "fixture" as const,
      page: getDemoExtraction(input.url),
    };
  }
}
