# Voyago and UXRay System

## Project Specification & Requirements

## Contents

**1 Project Overview 1**

**2 Project Objectives 2**

**3 Voyago Website Specification 2**
3.1 Technology Stack for Voyago................................ 2
3.2 Voyago Page Sections.................................... 2
3.3 Dark Patterns Embedded in Voyago............................ 3

**4 UXRay System Specification 3**
4.1 UXRay Core Workflow.................................... 4
4.2 UXRay Functional Steps................................... 4
4.3 Detection Categories..................................... 4
4.4 Data Extraction Requirements............................... 4
4.5 Detection Strategy...................................... 5
4.6 Scoring Model......................................... 5

**5 System Architecture & Engineering 5**
5.1 Technology Stack....................................... 5
5.2 UXRay User Interface Pages................................. 6
5.3 Highlight Visualization Requirements........................... 6

**6 Project Execution 6**
6.1 Demonstration Workflow.................................. 6
6.2 Team Role Distribution.................................... 6
6.3 Build Priority Sequence................................... 7
6.4 Final Deliverable Requirements............................... 7

## 1 Project Overview

Voyago is a simulated travel booking website designed to demonstrate manipulative user in-
terfacepracticescommonlyfoundincommercialplatforms. UXRayisawebsiteanalysissystem
that scans web pages, detects deceptive design patterns, highlights them visually, and gener-
ates a risk-based manipulation score.
Together,VoyagoandUXRayformacompletedemonstrationsystemthatshowshowuneth-
ical user interface patterns can be detected and explained through automated analysis.


## 2 Project Objectives

The primary objectives of this project are:

- Build a realistic travel booking landing page named Voyago.
- Integrate intentional dark patterns into the Voyago interface.
- Develop UXRay as a scanning system capable of analyzing web pages.
- Detect selected manipulative design patterns through structured rules.
- Present visual highlights on detected elements.
- Generate a numerical manipulation score.
- Provide a reliable and repeatable demonstration workflow suitable for live presentation.

## 3 Voyago Website Specification

Voyago is a single-page travel booking interface designed to simulate a modern hotel or travel
reservation experience. It must appear visually polished and realistic, similar to commercial
travel booking platforms.

### 3.1 Technology Stack for Voyago

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **Animation (Optional):** Framer Motion

### 3.2 Voyago Page Sections

**1. Navbar**

Thenavigationbarmustincludethefollowingelements: Voyagologo,Destinationsmenu,Deals
menu, Support menu, and a Login button.

**2. Hero Section**

The hero section promotes a travel destination and introduces urgency messaging. It must
include a destination headline, promotional text, an urgency message, a countdown timer, and
a primary booking button.

```
Exampleherocontent:
Explore Goa This Summer
Only 2 rooms left at this price
Offer expires in 02:
```

**3. Booking Cards Section**

This section displays travel or hotel options. Include three booking cards: Standard Room,
Deluxe Room, and Premium Sea View. Each card must contain:

- Room name, Price, and Availability text.
- Primary action button (must be visually dominant).
- Secondary action button (must be visually reduced).
**4. Signup Modal**

A modal window must automatically appear after approximately three seconds. The modal
must contain a promotional message, a signup prompt, a primary signup button, and a small
close icon.

**5. Email Subscription Section**

This section must collect email input and include a confirm-shaming opt-out line.

**6. Footer**

The footer must include a very small unsubscribe link with reduced visibility.

### 3.3 Dark Patterns Embedded in Voyago

Voyago must intentionally include the following five dark patterns:

1. **FakeUrgency:** Examples include ”Only 2 rooms left”, ”Limited-time deal”, or ”Hurry now”.
    Countdown timers reinforce this urgency messaging.
2. **ConfirmShaming:** Opt-outlanguagemustcreateguiltornegativeframing. Exampletext:
    ”No thanks, I like paying more”.
3. **Forced Signup:** A modal appears and interrupts the browsing flow, encouraging signup
    before continuing.
4. **Hidden Unsubscribe:** Unsubscribe text must be visually minimized through styling such
    as small font size, low opacity, and muted color.
5. **Misleading Call-To-Action Hierarchy:** Primary buttons must appear large and brightly
    colored. Secondary or decline buttons must appear small or visually weak.

## 4 UXRay System Specification

UXRayisthescanningandanalysiscomponentresponsiblefordetectingmanipulativeinterface
patterns. UXRayprocessesawebsiteURL,loadsthepage,extractsinterfaceelements,evaluates
suspicious patterns, and generates a structured report.


### 4.1 UXRay Core Workflow

1. Accept website URL input.
2. Load webpage using browser automation.
3. Extract visible elements.
4. Apply detection logic.
5. Validate findings.
6. Generate manipulation score.
7. Display highlighted results.

### 4.2 UXRay Functional Steps

- **Step 1:** User provides a website URL.
- **Step 2:** System loads webpage using automated browser execution.
- **Step3:** System extracts page content, including text elements, buttons, links, forms, pop-
    ups, modals, and style attributes.
- **Step 4:** Detection rules evaluate extracted content for suspicious patterns.
- **Step 5:** Classification logic assigns pattern categories.
- **Step 6:** Score engine generates numerical manipulation score.
- **Step 7:** Results interface displays findings and highlighted screenshot.

### 4.3 Detection Categories

UXRay will detect exactly five pattern categories:

1. **Fake Urgency Messaging:** Detects urgency phrases that pressure users into immediate
    action.
2. **Confirm Shaming Language:** Detects guilt-inducing opt-out or refusal messages.
3. **Forced Signup Interruption:** Detects modal interruptions that block interaction.
4. **Hidden Unsubscribe Options:** Detects visually minimized decline or unsubscribe con-
    trols.
5. **Misleading Button Hierarchy:** Detects visual dominance differences between primary
    and secondary actions.

### 4.4 Data Extraction Requirements

UXRay must extract the following data from each webpage: Page title, visible text blocks, but-
tons, links, forms, input fields, modal elements, timer-like text, element styling attributes (font
size, opacity, visibility, color prominence), bounding box positions, and a full-page screenshot.


### 4.5 Detection Strategy

Detection will be performed using structured rules combined with classification logic.

- **Rules are responsible for:** Matching suspicious phrases, identifying visual prominence
    differences, detecting hidden controls, and detecting forced interactions.
- **Classification logic is responsible for:** Assigning pattern categories, generating reason-
    ing messages, and assigning severity levels.

### 4.6 Scoring Model

Each detected pattern contributes a fixed number of points to the total manipulation score.

- Fake Urgency: 25 points
- Confirm Shaming: 20 points
- Forced Signup: 20 points
- Hidden Unsubscribe: 25 points
- Misleading CTA Hierarchy: 15 points
**Risk Level Mapping:**
- 0 to 30 points: Low Risk
- 31 to 60 points: Medium Risk
- 61 to 100 points: High Risk
**Expected Voyago Score:** Voyago is expected to produce a high-risk score due to the inten-
tionalinclusionofallpatterns. Forexample, ManipulationScore: 82outof100(RiskLevel: High
Risk).

## 5 System Architecture & Engineering

### 5.1 Technology Stack

- **Frontend and Backend Framework:** Next.js
- **Styling Framework:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Animation Library:** Framer Motion
- **Icon Library:** React Icons
- **Browser Automation:** Playwright
- **AI Processing:** Groq API
- **Database (Optional):** Supabase
- **Validation Library (Optional):** Zod


### 5.2 UXRay User Interface Pages

- **LandingPage:** Must include product title (UXRay), short description, URL input field, scan
    button, and demo scan button.
- **ScanningPage:** Mustdisplayprogressupdatesindicatinganalysissteps(Loadingwebsite,
    Extracting interface elements, Checking urgency language, Evaluating button hierarchy,
    Generating report).
- **Results Page:** Must display scanned URL, manipulation score, risk level, list of detected
    patterns, explanation text, and screenshot with highlighted elements.

### 5.3 Highlight Visualization Requirements

Detectedelementsmustbevisuallyhighlightedonthewebpagescreenshot. Highlightfeatures
include colored bounding boxes, pattern labels, severity indication, and clickable explanation
panels. Red boxes indicate high-risk elements. Yellow boxes indicate moderate-risk elements.

## 6 Project Execution

### 6.1 Demonstration Workflow

1. Open Voyago website.
2. Observe visible interface elements such as urgency text and popups.
3. Copy Voyago URL.
4. Open UXRay interface.
5. Paste Voyago URL into input field.
6. Start scanning process.
7. Display detected patterns.
8. Show highlighted screenshot.
9. Present final manipulation score.

### 6.2 Team Role Distribution

- **FrontendDeveloper:** Responsible for landing page layout, results page interface, anima-
    tions, and highlight visualization.
- **Scraper Developer:** Responsible for Playwright configuration, DOM extraction, screen-
    shot generation, and bounding box detection.
- **Detection Developer:** Responsible for rule engine, pattern classification, and score cal-
    culation.
- **Voyago Interface Developer:** Responsible for building Voyago page, embedding dark
    patterns, styling, and realism.


### 6.3 Build Priority Sequence

1. **Phase 1:** Build Voyago landing page structure.
2. **Phase 2:** Create UXRay landing page.
3. **Phase 3:** Implement Playwright page loading.
4. **Phase 4:** Extract visible page elements.
5. **Phase 5:** Implement detection rules.
6. **Phase 6:** Generate manipulation score.
7. **Phase 7:** Create results interface.
8. **Phase 8:** Implement highlight visualization.
9. **Phase 9:** Add animations and polish.
10. **Phase 10:** Optional database integration.

### 6.4 Final Deliverable Requirements

The completed system must include a functional Voyago landing page, a working UXRay scan-
ning mechanism, detection of defined dark patterns, visual highlighting of detected elements,
generation of manipulation score, and a stable demonstration workflow suitable for live pre-
sentation.
Atcompletion,thesystemmustdemonstratethefollowing. Voyagoloadsasarealistictravel
website. UXRay scans Voyago successfully. All embedded dark patterns are detected. Detected
elements are visually highlighted. The manipulation score is generated and displayed.


