import vercelChromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright";
import { chromium as playwrightCoreChromium } from "playwright-core";

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
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1200 },
      deviceScaleFactor: 1,
      ignoreHTTPSErrors: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });

    await navigateForCapture(page, url);

    const title = await page.title();

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

    const screenshot = await capturePageScreenshot(page, {
      title: title || url,
      url,
      width: screenshotSize.width,
      height: screenshotSize.height,
    });

    return {
      extractionMode: "playwright",
      page: {
        url,
        title: title || url,
        screenshot,
        elements: normalizedElements,
      },
    };
  } finally {
    await browser.close();
  }
}

async function launchBrowser() {
  const isVercelRuntime = Boolean(process.env.VERCEL);

  if (!isVercelRuntime) {
    return playwrightChromium.launch({ headless: true });
  }

  const executablePath = await vercelChromium.executablePath();

  return playwrightCoreChromium.launch({
    args: vercelChromium.args,
    executablePath,
    headless: true,
  });
}

async function navigateForCapture(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof launchBrowser>>["newPage"]>>,
  url: string
) {
  const strategies: Parameters<typeof page.goto>[1][] = [
    { waitUntil: "domcontentloaded", timeout: 20000 },
    { waitUntil: "load", timeout: 25000 },
    { waitUntil: "networkidle", timeout: 12000 },
  ];

  let lastError: unknown;

  for (const strategy of strategies) {
    try {
      await page.goto(url, strategy);
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollTo(0, 0));
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Navigation failed.");
}

async function capturePageScreenshot(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof launchBrowser>>["newPage"]>>,
  options: {
    title: string;
    url: string;
    width: number;
    height: number;
  }
) {
  const attempts: Array<() => Promise<{ src: string; width: number; height: number }>> = [
    async () => {
      const buffer = await page.screenshot({
        fullPage: true,
        type: "png",
        animations: "disabled",
      });

      return {
        src: `data:image/png;base64,${buffer.toString("base64")}`,
        width: options.width,
        height: options.height,
      };
    },
    async () => {
      const viewport = page.viewportSize() ?? { width: 1440, height: 1200 };
      const buffer = await page.screenshot({
        fullPage: false,
        type: "png",
        animations: "disabled",
      });

      return {
        src: `data:image/png;base64,${buffer.toString("base64")}`,
        width: viewport.width,
        height: viewport.height,
      };
    },
    async () => {
      const viewport = page.viewportSize() ?? { width: 1440, height: 1200 };
      const buffer = await page.screenshot({
        fullPage: false,
        type: "jpeg",
        quality: 80,
        animations: "disabled",
      });

      return {
        src: `data:image/jpeg;base64,${buffer.toString("base64")}`,
        width: viewport.width,
        height: viewport.height,
      };
    },
  ];

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch {
      continue;
    }
  }

  return createCaptureFallback(options);
}

function createCaptureFallback(options: {
  title: string;
  url: string;
  width: number;
  height: number;
}) {
  const width = Math.max(1280, Math.min(options.width || 1280, 1600));
  const height = Math.max(720, Math.min(options.height || 720, 1400));
  const safeTitle = escapeXml(options.title);
  const safeUrl = escapeXml(options.url);

  const svg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="48" y="48" width="${width - 96}" height="${height - 96}" rx="28" fill="#10192b" stroke="#334155"/>
  <text x="92" y="130" fill="#e2e8f0" font-size="38" font-family="Arial" font-weight="700">${safeTitle}</text>
  <text x="92" y="182" fill="#94a3b8" font-size="22" font-family="Arial">${safeUrl}</text>
  <text x="92" y="260" fill="#f8fafc" font-size="28" font-family="Arial" font-weight="700">Screenshot preview unavailable</text>
  <text x="92" y="308" fill="#94a3b8" font-size="22" font-family="Arial">UXRay analyzed the page, but the browser could not render a bitmap screenshot.</text>
</svg>
  `);

  return {
    src: `data:image/svg+xml;charset=utf-8,${svg}`,
    width,
    height,
  };
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
