import { z } from "zod";

import { getGroqClient, GROQ_MODEL } from "@/lib/groq";
import type {
  DarkPatternType,
  ExtractedElement,
  ExtractedPage,
  PatternFinding,
  SeverityLevel,
} from "@/lib/uxray/types";

const findingSchema = z.object({
  patternType: z.enum([
    "Fake Urgency",
    "Confirm Shaming",
    "Forced Signup",
    "Hidden Unsubscribe",
    "Misleading CTA Hierarchy",
  ]),
  severity: z.enum(["low", "moderate", "high"]),
  explanation: z.string().min(1),
  elementIds: z.array(z.string()).min(1),
});

const findingsSchema = z.object({
  findings: z.array(findingSchema),
});

function escapeJsonBlock(value: string) {
  return value.replace(/```json|```/g, "").trim();
}

function buildPrompt(page: ExtractedPage) {
  return [
    "You are UXRay, an auditor that classifies deceptive UX dark patterns.",
    "Analyze the provided extracted webpage elements and return JSON only.",
    'Return an object with a single key called "findings".',
    "Each finding must include patternType, severity, explanation, and elementIds.",
    "Only use these pattern types exactly: Fake Urgency, Confirm Shaming, Forced Signup, Hidden Unsubscribe, Misleading CTA Hierarchy.",
    "Severity must be one of: low, moderate, high.",
    "Do not invent element ids. Use only ids from the payload.",
    "",
    JSON.stringify(
      {
        page: {
          url: page.url,
          title: page.title,
        },
        elements: page.elements,
      },
      null,
      2
    ),
  ].join("\n");
}

function createFinding(
  patternType: DarkPatternType,
  severity: SeverityLevel,
  explanation: string,
  elementIds: string[]
): PatternFinding {
  return {
    id: `${patternType.toLowerCase().replace(/\s+/g, "-")}-${elementIds.join("-")}`,
    patternType,
    severity,
    explanation,
    elementIds,
  };
}

export function runRuleBasedAnalysis(page: ExtractedPage): PatternFinding[] {
  const findings: PatternFinding[] = [];
  const elements = page.elements.filter((element) => element.isVisible !== false);

  const urgencyElements = elements.filter((element) =>
    /(only \d+|limited[- ]time|hurry|expires|countdown|rooms left)/i.test(
      element.text
    )
  );
  if (urgencyElements.length > 0) {
    findings.push(
      createFinding(
        "Fake Urgency",
        "high",
        "Urgency language and countdown-style copy pressure the user to act immediately.",
        urgencyElements.map((element) => element.id)
      )
    );
  }

  const confirmShamingElements = elements.filter((element) =>
    /(no thanks|i like paying more|miss out|not interested in savings)/i.test(
      element.text
    )
  );
  if (confirmShamingElements.length > 0) {
    findings.push(
      createFinding(
        "Confirm Shaming",
        "high",
        "The opt-out copy uses guilt-laden language that frames refusal as a bad choice.",
        confirmShamingElements.map((element) => element.id)
      )
    );
  }

  const forcedSignupElements = elements.filter(
    (element) =>
      element.kind === "modal" &&
      (element.metadata?.interruptsFlow === true || element.metadata?.autoOpened === true)
  );
  if (forcedSignupElements.length > 0) {
    findings.push(
      createFinding(
        "Forced Signup",
        "high",
        "An interruptive signup modal appears before the user can continue browsing normally.",
        forcedSignupElements.map((element) => element.id)
      )
    );
  }

  const hiddenUnsubscribeElements = elements.filter(
    (element) =>
      /unsubscribe|opt out|decline/i.test(element.text) &&
      ((element.styles?.fontSize ?? 16) <= 14 || (element.styles?.opacity ?? 1) < 0.55)
  );
  if (hiddenUnsubscribeElements.length > 0) {
    findings.push(
      createFinding(
        "Hidden Unsubscribe",
        "high",
        "The unsubscribe control is visually minimized with small text and low contrast styling.",
        hiddenUnsubscribeElements.map((element) => element.id)
      )
    );
  }

  const primaryButtons = elements.filter(
    (element) => element.kind === "button" && element.styles?.isPrimary
  );
  const weakAlternatives = elements.filter(
    (element) =>
      (element.kind === "button" || element.kind === "link") &&
      element.styles?.isMuted &&
      ((element.styles?.fontSize ?? 18) < 18 || (element.styles?.opacity ?? 1) < 0.85)
  );
  if (primaryButtons.length > 0 && weakAlternatives.length > 0) {
    findings.push(
      createFinding(
        "Misleading CTA Hierarchy",
        "moderate",
        "Primary actions are made visually dominant while the secondary or dismissive option is subdued.",
        [primaryButtons[0].id, weakAlternatives[0].id]
      )
    );
  }

  return findings;
}

export async function analyzeDarkPatterns(page: ExtractedPage) {
  const groq = getGroqClient();

  if (!groq) {
    return postProcessFindings(page, runRuleBasedAnalysis(page));
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Return valid JSON only. Never include markdown fences or extra commentary.",
        },
        {
          role: "user",
          content: buildPrompt(page),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return postProcessFindings(page, runRuleBasedAnalysis(page));
    }

    const parsed = findingsSchema.parse(JSON.parse(escapeJsonBlock(content)));

    return postProcessFindings(
      page,
      parsed.findings.map((finding) =>
      createFinding(
        finding.patternType,
        finding.severity,
        finding.explanation,
        finding.elementIds
      )
    ));
  } catch {
    return postProcessFindings(page, runRuleBasedAnalysis(page));
  }
}

function postProcessFindings(page: ExtractedPage, findings: PatternFinding[]) {
  const elementsById = new Map(page.elements.map((element) => [element.id, element]));

  return findings
    .map((finding) => {
      const refinedIds = refineElementIdsForFinding(finding, elementsById);

      return {
        ...finding,
        id: `${finding.patternType.toLowerCase().replace(/\s+/g, "-")}-${refinedIds.join("-")}`,
        elementIds: refinedIds,
      };
    })
    .filter((finding) => finding.elementIds.length > 0);
}

function refineElementIdsForFinding(
  finding: PatternFinding,
  elementsById: Map<string, ExtractedElement>
) {
  const candidates = finding.elementIds
    .map((id) => elementsById.get(id))
    .filter((element): element is ExtractedElement => Boolean(element))
    .filter((element) => element.bounds);

  if (candidates.length === 0) {
    return finding.elementIds.slice(0, 2);
  }

  const filtered = candidates
    .sort(compareElementPriority)
    .filter((candidate, index, all) => {
      return !all.some((other, otherIndex) => {
        if (index === otherIndex || !other.bounds || !candidate.bounds) {
          return false;
        }

        if (other.id === candidate.id) {
          return false;
        }

        const overlapsHeavily = getOverlapRatio(candidate, other) > 0.72;
        const otherIsPreferred = compareElementPriority(other, candidate) < 0;

        return overlapsHeavily && otherIsPreferred;
      });
    });

  const deduped = filtered.filter((candidate, index, all) => {
    return !all.slice(0, index).some((other) => {
      if (!candidate.bounds || !other.bounds) {
        return false;
      }

      const sameRegion = getOverlapRatio(candidate, other) > 0.55;
      const sameKind = candidate.kind === other.kind;
      return sameRegion && sameKind;
    });
  });

  const maxElements = finding.patternType === "Misleading CTA Hierarchy" ? 2 : 3;

  return deduped.slice(0, maxElements).map((element) => element.id);
}

function compareElementPriority(left: ExtractedElement, right: ExtractedElement) {
  const priorityDelta = getKindPriority(left.kind) - getKindPriority(right.kind);

  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const leftArea = getArea(left);
  const rightArea = getArea(right);
  return leftArea - rightArea;
}

function getKindPriority(kind: ExtractedElement["kind"]) {
  switch (kind) {
    case "button":
      return 0;
    case "link":
      return 1;
    case "modal":
      return 2;
    case "timer":
      return 3;
    case "input":
      return 4;
    case "text":
      return 5;
    case "form":
      return 6;
    case "image":
      return 7;
    default:
      return 8;
  }
}

function getArea(element: ExtractedElement) {
  if (!element.bounds) {
    return Number.POSITIVE_INFINITY;
  }

  return element.bounds.width * element.bounds.height;
}

function getOverlapRatio(left: ExtractedElement, right: ExtractedElement) {
  if (!left.bounds || !right.bounds) {
    return 0;
  }

  const xOverlap =
    Math.max(
      0,
      Math.min(left.bounds.x + left.bounds.width, right.bounds.x + right.bounds.width) -
        Math.max(left.bounds.x, right.bounds.x)
    );
  const yOverlap =
    Math.max(
      0,
      Math.min(left.bounds.y + left.bounds.height, right.bounds.y + right.bounds.height) -
        Math.max(left.bounds.y, right.bounds.y)
    );

  const overlapArea = xOverlap * yOverlap;

  if (overlapArea === 0) {
    return 0;
  }

  return overlapArea / Math.min(getArea(left), getArea(right));
}
