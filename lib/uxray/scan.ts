import { analyzeDarkPatterns } from "@/lib/uxray/analysis";
import { extractPageWithPlaywright } from "@/lib/uxray/extractor";
import { getGenericFixture, getVoyagoFixture } from "@/lib/uxray/fixtures";
import { calculateUxRayScore } from "@/lib/uxray/scoring";
import type { ExtractedPage, ScanResult } from "@/lib/uxray/types";

export type ScanInput = {
  url: string;
  extractedPage?: ExtractedPage;
};

function isFixtureBackedVoyagoUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "voyago-hackthon.vercel.app" || hostname === "voyago-demo.local";
  } catch {
    return false;
  }
}

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

  if (isFixtureBackedVoyagoUrl(input.url)) {
    return {
      extractionMode: "fixture" as const,
      page: getVoyagoFixture(input.url),
      note: undefined,
    };
  }

  try {
    return await extractPageWithPlaywright(input.url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message.split("\n")[0] : "Unable to launch live capture.";

    console.error("UXRay live capture failed", {
      url: input.url,
      message,
    });

    return {
      extractionMode: "fixture" as const,
      page: getDemoExtraction(input.url),
      note: `Live page capture was unavailable for this URL. ${message}`,
    };
  }
}
