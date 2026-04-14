# CodeGuardian AI — UI Design Document (for Vibe IDE / v0 / Bolt)

**Purpose:** Paste sections into AI UI builders or hand to a designer. Optimized for **hero = editorial left typography + animated code review demo on the right**.

---

## 1. Product & positioning

| Field | Value |
|--------|--------|
| **Product name** | CodeGuardian AI |
| **One-line** | Your AI senior reviewer for PRs, uploads, and business rules — before production breaks. |
| **Audience** | Junior → senior engineers, team leads, DevOps |
| **Vibe** | Dark-first, Linear / Vercel / Cursor / Snyk — minimal, fast, trustworthy |

---

## 2. Design system

### 2.1 Color (dark-first)

- **Background:** `#030712` → `#0B1220` vertical subtle gradient  
- **Surface / cards:** `#111827` with `border-white/10`  
- **Primary gradient (CTAs, accents):** `#6366F1` → `#8B5CF6`  
- **Success / low risk:** `#22C55E`  
- **Warning:** `#F59E0B`  
- **Danger / security:** `#EF4444`  
- **Text primary:** `#F8FAFC`  
- **Text muted:** `#94A3B8`

### 2.2 Typography

- **Display / hero:** **Geist** or **Inter** — tight tracking, large sizes  
- **Body:** Inter  
- **Code / editor:** **JetBrains Mono** or **Geist Mono**

**Hero type scale (desktop):**

- H1: `clamp(2.75rem, 5vw, 4.5rem)` — font-weight **600–700**, line-height **1.05**  
- Subhead: `clamp(1rem, 1.5vw, 1.25rem)` — muted, max-width **36ch**

### 2.3 Motion principles

- **Subtle:** 200–400ms ease-out; no gimmicky bounce  
- **Hero right panel:** staged sequence — editor fades in → “typing” or line highlights → AI callouts slide in  
- **Scroll:** stagger children 50–80ms; respect `prefers-reduced-motion`

### 2.4 Tech (UI)

Next.js 14+, React, TypeScript, Tailwind CSS, **shadcn/ui**, **Framer Motion**, optional **Aceternity** for spotlight/glow cards. Editor: **Monaco** or Monaco-styled mock if bundle size matters.

---

## 3. Global layout

1. **Sticky glass navbar** (blur, `border-b border-white/5`)  
2. **Hero** (two columns, below)  
3. **Social proof** — “Trusted by teams shipping to production” + logo strip  
4. **Feature grid** — 6 cards, 3×2 desktop  
5. **How it works** — 4 steps, horizontal on desktop  
6. **AI agents** — node graph or 4 agent cards with connecting lines (optional **React Flow**)  
7. **Interactive mini-demo** (optional strip): snippet + instant “O(n²)” / security badge  
8. **Pricing** — Free / Pro / Team (Pro visually elevated)  
9. **Testimonials**  
10. **Final CTA** — full-width gradient band  
11. **Footer**

---

## 4. Navbar

**Left:** Logo mark + “CodeGuardian”  
**Center (optional md+):** Features · How it works · Pricing  
**Right:** Docs · Log in · **Get started** (primary gradient pill, subtle glow on hover)

---

## 5. Hero section (primary spec)

### 5.1 Layout

- **Desktop:** CSS grid **12 columns** — left **7 cols**, right **5 cols**, gap `3–4rem`, vertical align **center**  
- **Mobile:** stack — headline → subtext → CTAs → then editor demo (full width)

### 5.2 Left column — typography (hero)

**Headline (two lines, strong hierarchy):**

- Line 1: **“AI code review”** — slightly smaller or same size, gradient text optional  
- Line 2: **“that catches what humans miss.”** — largest weight  

*Alternative single block:* **“AI Code Review That Never Misses Bugs.”**

**Subtext (2–3 lines max):**

> Upload code or a module, add your business rules, and get multi-agent analysis: bugs, security, performance, architecture — plus edge cases and risk signals before merge.

**CTAs (horizontal):**

1. **Primary:** “Start free review” — gradient, arrow icon optional  
2. **Secondary:** “See live demo” — outline `border-white/20`, ghost hover  

**Trust chips (row under buttons, small pills):**

`Multi-agent AI` · `Business logic checks` · `Security & performance`

### 5.3 Right column — animated “code review” panel

Treat as a **product mock**, not a full IDE:

**Container:**

- Rounded `xl` or `2xl`, `border border-white/10`, inner shadow  
- Top bar: three dots, fake filename `withdraw.ts`, small “AI Reviewing…” pulsing dot **green/emerald**  
- **Body split:**
  - **~60%** Monaco-style editor with line numbers  
  - **~40%** or **overlay drawer** — “AI findings” list (cards)

**Sample code (visible in editor):**

```typescript
function withdraw(amount: number) {
  if (balance > amount) {
    balance -= amount;
  }
}
```

**Animated sequence (spec for builder):**

1. Brief highlight on `if (balance > amount)`  
2. Callout 1 slides in: **“Edge case”** — “`amount <= 0` not handled”  
3. Callout 2: **“Business rule”** — “Daily limit not enforced”  
4. Optional: thin progress bar “Risk score” animating to **72%** with amber color  

**Visual details:**

- Callouts use left **accent border** (amber / red) + icon  
- Subtle **grid or noise** in background behind the panel (opacity 3–5%)  
- Soft **purple/blue glow** behind the panel (`blur-3xl`, not overwhelming)

---

## 6. Feature grid (copy for cards)

| Title | Body |
|--------|------|
| **PR & upload review** | Single file, zip, or module — static + AI hybrid analysis. |
| **Business logic mode** | Paste requirements; AI checks implementation and missing cases. |
| **Edge case generator** | Suggested tests and failure modes from real behavior. |
| **Security scanner** | Injection, XSS, secrets, unsafe patterns — with fixes. |
| **Performance** | Complexity, hotspots, N+1-style patterns where detectable. |
| **Architecture** | Boundaries, layering, dependency smells for services and modules. |

Each card: icon in rounded square, **hover** = border brightens + 2px lift (`translateY(-2px)`).

---

## 7. How it works

1. **Upload** — Code or repo slice  
2. **Context** — Optional business rules & constraints  
3. **Analyze** — Security, logic, performance, architecture agents  
4. **Report** — Scores, patches, chat, export  

Use numbered steps with **connecting line** or arrows (motion: line draws on scroll).

---

## 8. AI agents block

Four nodes: **Security** · **Logic** · **Performance** · **Architecture**  
Central label: **“Orchestrated review”**  
Animation: sequential pulse along edges; or static with hover tooltips.

---

## 9. Pricing (example tiers)

| Tier | Price | Bullets |
|------|--------|---------|
| **Free** | $0 | Limited lines/month, basic findings, watermarked export optional |
| **Pro** | $19/mo | Business logic mode, edge cases, chat, higher limits |
| **Team** | $49/mo | Seats, shared history, CI hooks (future), priority processing |

Highlight **Pro** with gradient border and “Most popular” pill.

---

## 10. Accessibility

- Focus rings visible on all interactive elements  
- Contrast ≥ WCAG AA for text on surfaces  
- Editor demo: don’t rely only on color — icons + labels on warnings  

---

## 11. Single prompt for Vibe IDE (copy-paste)

Use the block below as **one message** to Vibe IDE / v0 / Bolt.

```
Build a production-quality marketing landing page for a SaaS called "CodeGuardian AI" — an AI code review, bug detection, and business-logic validation product.

Stack: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion. Dark mode first.

Visual reference: Linear, Vercel, Cursor, Snyk — minimal, high contrast, subtle motion.

HERO (most important):
- Two-column layout on desktop (roughly 55–60% left / 40–45% right), stacked on mobile.
- LEFT: Massive editorial typography using Geist or Inter. Headline: "AI code review that catches what humans miss." Subheadline (muted, max ~40ch): explain upload/module review, business rules, and multi-agent analysis for bugs, security, performance, and architecture. Two buttons: primary gradient "Start free review" and secondary outline "See live demo". Under buttons, small trust pills: "Multi-agent AI", "Business logic checks", "Security & performance".
- RIGHT: A faux IDE panel (Monaco-like): rounded-2xl, dark surface, border white/10, mac-style window dots, filename "withdraw.ts", status "AI reviewing" with pulse. Show TypeScript snippet for withdraw() with flawed logic. Animate: highlight the if-condition, then slide/fade in AI finding cards — (1) Edge case: amount <= 0 not handled, (2) Business rule: daily withdrawal limit missing, (3) optional mini "Risk score" bar animating to ~72% in amber. Use Framer Motion sequence; respect prefers-reduced-motion. Soft purple/indigo glow blob behind the panel.

Rest of page:
- Sticky glass navbar: logo + CodeGuardian, links Features / Pricing / Docs, Login, CTA Get started.
- Logo strip "Trusted by teams shipping to production".
- Feature grid 3x2: PR/upload review, business logic validation, edge case generator, security scanner, performance analysis, architecture checks — icons, short copy, hover lift + border glow.
- How it works: 4 steps with connecting line — Upload → Add business context → Multi-agent analyze → Report & fixes.
- AI agents section: four agent cards or simple node diagram — Security, Logic, Performance, Architecture — with subtle animated connectors.
- Pricing: Free, Pro ($19/mo, highlighted), Team ($49/mo) with clear feature bullets.
- Two testimonials with avatars.
- Final CTA band with gradient background and two buttons.
- Footer with Product / Company / Legal columns.

Colors: background #030712 to #0B1220, surfaces #111827, primary gradient #6366F1 to #8B5CF6, accents green #22C55E, warning amber, danger red. Typography: Inter/Geist + JetBrains Mono for code.

Deliver clean component structure, responsive spacing, and polished hover/focus states.
```

---

## 12. Optional follow-up prompts for Vibe IDE

- **“Add a below-the-fold ‘interactive snippet’ section: user picks Python or TS, sees nested loop, AI badge shows O(n²) with suggestion.”**  
- **“Design the logged-in dashboard: sidebar, metrics cards, recent scans table, quality score radial chart.”**  
- **“Split view: left Monaco, right chat — Cursor-style — for product page ‘Chat with your code’ feature.”**

---

*Document version: 1.0 — aligned with CodeGuardian AI / AI_BASED_BUG_DETECTAOR product vision.*
