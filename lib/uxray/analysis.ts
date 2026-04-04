import { z } from "zod";

import { getGroqClient, GROQ_MODEL } from "@/lib/groq";
import type {
  DarkPatternType,
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
    return runRuleBasedAnalysis(page);
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
      return runRuleBasedAnalysis(page);
    }

    const parsed = findingsSchema.parse(JSON.parse(escapeJsonBlock(content)));

    return parsed.findings.map((finding) =>
      createFinding(
        finding.patternType,
        finding.severity,
        finding.explanation,
        finding.elementIds
      )
    );
  } catch {
    return runRuleBasedAnalysis(page);
  }
}
