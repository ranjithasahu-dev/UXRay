import { chromium } from "playwright";

import type { ExtractedElement, ExtractedPage } from "@/lib/uxray/types";

type BrowserExtractionResult = {
  page: ExtractedPage;
  extractionMode: "playwright";
  note?: undefined;
};

function inferKind(tagName: string, role: string | null, text: string) {
  const tag = tagName.toLowerCase();

  if (tag === "button" || role === "button") {
    return "button" as const;
  }

  if (tag === "a") {
    return "link" as const;
  }

  if (tag === "input" || tag === "textarea" || tag === "select") {
    return "input" as const;
  }

  if (tag === "form") {
    return "form" as const;
  }

  if (
    role === "dialog" ||
    role === "alertdialog" ||
    /sign up|subscribe|newsletter|join/i.test(text)
  ) {
    return "modal" as const;
  }

  if (/\b\d{1,2}:\d{2}\b|countdown|expires|minutes left|hours left/i.test(text)) {
    return "timer" as const;
  }

  return "text" as const;
}

export async function extractPageWithPlaywright(url: string): Promise<BrowserExtractionResult> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1200 },
      deviceScaleFactor: 1,
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(1200);

    const title = await page.title();

    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "png",
    });

    const screenshotSize = await page.evaluate(() => ({
      width: Math.max(
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
        window.innerWidth
      ),
      height: Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.clientHeight,
        window.innerHeight
      ),
    }));

    const elements = await page.evaluate(() => {
      const selector = [
        "button",
        "a",
        "input",
        "textarea",
        "select",
        "form",
        "[role='button']",
        "[role='dialog']",
        "[role='alertdialog']",
        "[aria-modal='true']",
        "h1",
        "h2",
        "h3",
        "p",
        "span",
        "div",
        "small",
        "label",
      ].join(",");

      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const seen = new Set<string>();

      return nodes
        .map((element, index) => {
          const text =
            element.innerText?.replace(/\s+/g, " ").trim() ||
            element.getAttribute("aria-label") ||
            element.getAttribute("placeholder") ||
            "";

          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          const role = element.getAttribute("role");
          const visibility =
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            Number(style.opacity || "1") > 0.05 &&
            rect.width > 6 &&
            rect.height > 6;

          if (!visibility || text.length < 2) {
            return null;
          }

          const signature = [
            element.tagName,
            text,
            Math.round(rect.x),
            Math.round(rect.y),
          ].join("|");

          if (seen.has(signature)) {
            return null;
          }
          seen.add(signature);

          const backgroundColor = style.backgroundColor;
          const opacity = Number(style.opacity || "1");
          const fontSize = Number.parseFloat(style.fontSize || "16");
          const fontWeight = Number.parseInt(style.fontWeight || "400", 10) || 400;
          const zIndex = Number.parseInt(style.zIndex || "0", 10) || 0;
          const isFixed = style.position === "fixed";
          const isPrimary =
            (element.tagName === "BUTTON" || role === "button" || element.tagName === "A") &&
            backgroundColor !== "rgba(0, 0, 0, 0)" &&
            opacity > 0.9 &&
            fontWeight >= 500;
          const isMuted =
            opacity < 0.8 ||
            fontSize <= 14 ||
            /rgba?\(/.test(style.color) ||
            backgroundColor === "rgba(0, 0, 0, 0)";

          return {
            id: `el-${index}`,
            kind: "text",
            text,
            role: role ?? undefined,
            selector: element.tagName.toLowerCase(),
            isVisible: true,
            bounds: {
              x: Math.max(0, Math.round(rect.x + window.scrollX)),
              y: Math.max(0, Math.round(rect.y + window.scrollY)),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
            styles: {
              fontSize,
              opacity,
              prominentColor: backgroundColor,
              fontWeight,
              isPrimary,
              isMuted,
            },
            metadata: {
              tagName: element.tagName.toLowerCase(),
              interruptsFlow:
                isFixed && rect.width > window.innerWidth * 0.35 && rect.height > 120,
              autoOpened: isFixed && zIndex >= 10,
            },
          };
        })
        .filter(Boolean);
    });

    const normalizedElements = (elements as ExtractedElement[]).map((element) => ({
      ...element,
      kind: inferKind(element.selector ?? "div", element.role ?? null, element.text),
    }));

    return {
      extractionMode: "playwright",
      page: {
        url,
        title: title || url,
        screenshot: {
          src: `data:image/png;base64,${screenshotBuffer.toString("base64")}`,
          width: screenshotSize.width,
          height: screenshotSize.height,
        },
        elements: normalizedElements,
      },
    };
  } finally {
    await browser.close();
  }
}
