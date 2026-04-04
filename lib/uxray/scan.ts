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
  return getGenericFixture(url);
}

export async function runUxRayScan(input: ScanInput): Promise<ScanResult> {
  const extractionResult = await getPageForScan(input);
  const page = extractionResult.page;
  const findings = extractionResult.note ? [] : await analyzeDarkPatterns(page);
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
      note: extractionResult.note,
    },
  };
}

async function getPageForScan(input: ScanInput) {
  if (input.extractedPage) {
    return {
      extractionMode: "fixture" as const,
      page: input.extractedPage,
      note: undefined,
    };
  }

  if (/voyago-demo\.local/i.test(input.url)) {
    return {
      extractionMode: "fixture" as const,
      page: getVoyagoFixture(input.url),
      note: "Using the local fixture dataset for this URL.",
    };
  }

  try {
    return await extractPageWithPlaywright(input.url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message.split("\n")[0] : "Unable to launch live capture.";

    return {
      extractionMode: "fixture" as const,
      page: getDemoExtraction(input.url),
      note: `Live page capture was unavailable for this URL. ${message}`,
    };
  }
}
