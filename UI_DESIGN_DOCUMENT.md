# CodeGuardian AI - UI Design Document

**For**: Vibe IDE / AI UI Builders (v0, Bolt)  
**Version**: 1.0  
**Design System**: Modern AI SaaS (Linear, Vercel, Cursor inspired)

---

## 1. Design System Overview

### 1.1 Color Palette

**Primary Colors**:

```
Primary Purple: #6366F1 (Indigo-500)
Primary Blue: #3B82F6 (Blue-500)
Accent Gradient: Purple → Blue
```

**Semantic Colors**:

```
Success: #22C55E (Green-500)      | ✓ For passed checks
Warning: #F59E0B (Amber-500)      | ⚠ For warnings
Error: #EF4444 (Red-500)          | ✗ For critical issues
Info: #06B6D4 (Cyan-500)          | ℹ For information
```

**Neutral Colors**:

```
Dark Background: #0F172A (Slate-950)
Secondary: #1E293B (Slate-900)
Border: #334155 (Slate-700)
Text Primary: #F1F5F9 (Slate-100)
Text Secondary: #CBD5E1 (Slate-300)
```

### 1.2 Typography

```
Headings (H1-H4): "Geist" or "Inter Bold"
  - H1 (Hero): 56px, weight 700, line-height 1.2
  - H2 (Section): 40px, weight 700, line-height 1.3
  - H3 (Sub): 28px, weight 700, line-height 1.4
  - H4 (Card Title): 20px, weight 600, line-height 1.5

Body Text: "Inter"
  - Large: 18px, weight 500
  - Regular: 16px, weight 400
  - Small: 14px, weight 400

Code: "JetBrains Mono" or "Fira Code"
  - Size: 12px-14px
  - Monospace weight: 400-500
```

### 1.3 Spacing System

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### 1.4 Border Radius

```
sm: 4px      (inputs, small elements)
md: 8px      (cards, containers)
lg: 12px     (sections, modals)
full: 9999px (badges, circular)
```

---

## 2. Page Structure

### 2.1 Navbar Component

**Position**: Sticky top  
**Height**: 64px  
**Background**: Transparent glass (backdrop blur)  
**Border**: Bottom subtle divider

```
┌──────────────────────────────────────────────────────┐
│  Logo    Features  Docs  Pricing    [Login] [Sign Up]│
└──────────────────────────────────────────────────────┘
```

**Left Section**:

- Logo (32x32)
- Text: "CodeGuardian" (20px, bold)

**Center Section**:

- Navigation links (gray, hover → primary color)
  - Features
  - Docs
  - Pricing

**Right Section**:

- Login button (outline)
- Sign Up button (gradient, filled)

**Interactive Elements**:

- Hover: Text color → primary
- Mobile: Hamburger menu with drawer

---

### 2.2 Hero Section (Main Landing)

**Layout**: Two-column responsive grid

#### Left Column (Typography)

```
┌─────────────────────────────────┐
│  AI Code Review                 │
│  That Never Misses Bugs         │
│                                 │
│  Upload your code, describe     │
│  the business logic, and let    │
│  AI detect bugs, security       │
│  issues, missing edge cases,    │
│  and architecture flaws.        │
│                                 │
│  [Start Free Review] [See Demo] │
│                                 │
│  ✓ GitHub Integrated           │
│  ✓ Multi-Agent AI              │
│  ✓ Enterprise Ready            │
└─────────────────────────────────┘
```

**Headline**:

- Text: "AI Code Review That Never Misses Bugs"
- Font: H1 (56px Geist Bold)
- Color: Gradient primary
- Animation: Fade in + slide up (on load)

**Subheading**:

- Text: "Upload your code, describe the business logic, and let AI detect bugs, security issues, missing edge cases, and architecture flaws."
- Font: 18px Inter
- Color: Text secondary
- Animation: Staggered fade in

**CTA Buttons**:

```
[Start Free Code Review]  [Watch Demo →]
 Primary (Purple)         Secondary (outline)
```

- Button 1: Gradient fill, hover glow
- Button 2: Outline, hover fill light

**Trust Badges**:

```
✓ GitHub Integrated    ✓ Multi-Agent AI    ✓ Enterprise Ready
```

- Font: 14px, gray
- Icons: Checkmark
- Animation: Fade in staggered

#### Right Column (Code Editor Animation)

**Monaco Editor Mockup**:

```
┌─────────────────────────────────────┐
│ 🔴 ● ✕                              │
│ payment.js                          │
├─────────────────────────────────────┤
│  1  function withdraw(amount) {     │
│  2    if(balance > amount){         │
│  3      balance -= amount           │
│  4    }                             │
│  5  }                               │
│                                     │
│  ⚠️ Missing Edge Case               │
│     withdraw(0)                     │
│     withdraw(-10)                   │
│                                     │
│  🔒 Security Risk                   │
│     No rate limiting                │
└─────────────────────────────────────┘
```

**Animations**:

- Code appears with typing animation: 2s
- Suggestions fade in: staggered 0.3s
- Highlighting pulses on issues
- Loop animation every 8s

---

### 2.3 Features Section

**Layout**: 3-column grid on desktop, 1-column on mobile

**Section Header**:

```
Powerful Features Built for Real Development
Detect bugs, security issues, and architectural flaws
```

**Feature Cards** (6 total):

#### Card 1: AI Code Review

```
┌──────────────────────────┐
│  🧠 Icon                 │
│                          │
│  AI Code Review          │
│  Detect logic bugs,      │
│  vulnerabilities, and    │
│  bad coding practices    │
│  automatically.          │
└──────────────────────────┘
```

**Card Styling**:

- Background: Slate-900 with border
- Border: 1px solid Slate-700
- Border radius: 12px
- Padding: 24px
- Hover effect:
  - Border color → primary
  - Shadow glow
  - Transform: translateY(-2px)
  - Transition: 200ms

**Icons** (SVG or Lucide React):

- Card 1: Brain + Code
- Card 2: Code
- Card 3: AlertTriangle
- Card 4: Network
- Card 5: Shield
- Card 6: Zap

**All 6 Feature Cards**:

1. **AI Code Review** - Detect logic bugs
2. **Business Logic Validation** - Verify implementation
3. **Edge Case Detection** - Find missing cases
4. **Multi-Agent Review** - Collaborative analysis
5. **Security Scanner** - Detect vulnerabilities
6. **Auto Fix Suggestions** - Optimized code

---

### 2.4 How It Works Section

**Layout**: Horizontal timeline (desktop), vertical on mobile

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Upload  │───→│ Describe │───→│ AI       │───→│ Report   │
│ Code    │    │ Business │    │ Analyzes │    │ Generated│
│         │    │ Logic    │    │          │    │          │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Each Step**:

- Icon (32x32)
- Title (20px bold)
- Description (14px gray)
- Arrow between steps (animated)

**Animations**:

- Icons appear on scroll: fade + scale
- Arrows animate: width 0 → full (1s)

---

### 2.5 AI Agents Visualization Section

**Title**: "Multi-Agent AI Collaboration"

**Visual Layout** (using react-flow):

```
           ┌─────────────────┐
           │  Code Uploaded  │
           └────────┬────────┘
                    ▼
        ┌───────────────────────┐
        │  Code Parser Agent    │
        └───────────┬───────────┘
                    ▼
      ┌─────────────┼──────────────┐
      │             │              │
      ▼             ▼              ▼
  ┌────────┐  ┌──────────┐  ┌──────────┐
  │Security│  │Performance│ │Logic     │
  │Agent   │  │Agent      │ │Agent     │
  └────────┘  └──────────┘  └──────────┘
      │             │              │
      └─────────────┼──────────────┘
                    ▼
        ┌───────────────────────┐
        │  Final Report         │
        └───────────────────────┘
```

**Node Styling**:

- Background: Linear gradient (purple → blue)
- Border: 2px solid primary
- Padding: 16px
- Color: White text
- Border radius: 8px

**Animations**:

- Nodes appear on scroll
- Edges draw with animation
- Processing animation (pulse effect)

---

### 2.6 Pricing Section

**Layout**: 3 pricing cards + 1 highlight

```
┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│  Free Plan   │  │  Pro Plan   │  │  Team Plan   │
│  $0/mo       │  │★ $19/mo     │  │  $49/mo      │
│              │  │  Recommended│  │              │
│  ✓ Feature 1 │  │  ✓ Feature 1│  │  ✓ Feature 1 │
│  ✓ Feature 2 │  │  ✓ Feature 2│  │  ✓ Feature 2 │
│  ✗ Feature 3 │  │  ✓ Feature 3│  │  ✓ Feature 3 │
│              │  │             │  │              │
│ [Get Started]│  │[Start Trial]│  │ [Contact]    │
└──────────────┘  └─────────────┘  └──────────────┘
```

**Card Styling**:

- Free & Team: Outline style
- Pro: Filled with gradient, highlighted with badge "Recommended"
- Pro card scale: 1.05x (larger)
- Hover: Border color change, shadow

**Features Listed**:

- Checkmark icon (green) for included
- X icon (gray) for excluded
- Tooltip on hover for descriptions

---

### 2.7 Testimonials Section

**Layout**: Carousel or grid of 3-4 cards

```
┌───────────────────────────────────┐
│ "Saved our team 10 hours/week     │
│  on code reviews. Game changer."  │
│                                   │
│ ⭐⭐⭐⭐⭐                            │
│ Sarah Chen, Eng Manager @ Startup │
│ 🔵 Company Logo                   │
└───────────────────────────────────┘
```

**Card Details**:

- Quote text: 16px italic
- Stars: 5 visible, hover tooltip
- Avatar: 32x32 circle image
- Name: 14px bold
- Title: 12px gray

---

### 2.8 Final CTA Section

**Layout**: Centered with background animation

```
┌──────────────────────────────────┐
│                                  │
│   Let AI Review Your Code        │
│   Before Production Breaks It    │
│                                  │
│  [Start Free Trial]  [Book Demo] │
│                                  │
│   Background: Animated gradient  │
└──────────────────────────────────┘
```

**Animations**:

- Gradient background animates (color shift 10s loop)
- Text fade in on scroll
- Button hover: glow effect

---

### 2.9 Footer

**Layout**: 4 columns + copyright

```
┌─────────────────────────────────────┐
│ Product      Company   Resources  ●  │
│ ├─ Features  ├─ About   ├─ Docs   │  │
│ ├─ Pricing   ├─ Blog    ├─ API    │  │
│ ├─ Docs      ├─ Careers ├─ Status │  │
│                         ├─ Support│  │
│                                     │
│ © 2026 CodeGuardian. All rights    │
│ reserved. | Privacy | Terms        │
└─────────────────────────────────────┘
```

**Styling**:

- Background: Slate-950 (dark)
- Border top: Subtle
- Text: Secondary color
- Links hover: Primary color

---

## 3. Dashboard Pages

### 3.1 Dashboard Home

**Layout**: Grid + sidebar

```
┌──────────────────────────────────────────┐
│ ◀ Dashboard                              │
├──────────────────────────────────────────┤
│  Sidebar              │  Main Content    │
│ ├─ Dashboard         │                  │
│ ├─ Upload Code      │  Welcome Back     │
│ ├─ Scans            │  [Quick Upload]   │
│ ├─ Analytics        │                  │
│ ├─ Settings         │  Your Metrics    │
│                     │  ├─ Scans: 45    │
│                     │  ├─ Bugs: 234    │
│                     │  ├─ Score: 8.2/10│
│                     │  └─ Issues: 15   │
│                     │                  │
│                     │  Recent Scans    │
│                     │  [Table of scans]│
└──────────────────────────────────────────┘
```

**Metrics Cards**:

- Style: Gradient borders
- Icons with numbers
- Tooltip on hover
- Animation: Numbers count up on load

---

### 3.2 Upload Code Page

**Two-Column Layout**:

**Left: Upload Area**

```
┌────────────────────────────┐
│  Drag & Drop Zone          │
│  or                        │
│  [Select Files]            │
│                            │
│  Supported:               │
│  .js .ts .py .java .cs    │
│                            │
│  Max: 10MB per file       │
└────────────────────────────┘
```

**Right: Business Logic Input**

```
┌────────────────────────────┐
│  Business Requirements     │
│  ┌──────────────────────┐ │
│  │ Describe your        │ │
│  │ business logic and   │ │
│  │ rules...             │ │
│  └──────────────────────┘ │
│                            │
│  Example:                 │
│  "Check balance before   │
│   withdrawal"             │
│                            │
│  [Cancel] [Analyze]      │
└────────────────────────────┘
```

**Upload Area Animation**:

- Dashed border
- Hover: Border color change
- Drag over: Background highlight
- Upload progress: Progress bar

---

### 3.3 Code Review Results Page

**Layout**: 3 sections

#### Section 1: Summary

```
┌──────────────────────────────┐
│  Review Report              │
│  payment-service.js         │
│                             │
│  Overall Score: 8.2 / 10    │
│                             │
│  ├─ Security: 7.5 ⚠        │
│  ├─ Performance: 8.0        │
│  ├─ Maintainability: 8.5 ✓ │
│  └─ Architecture: 8.2       │
└──────────────────────────────┘
```

**Score Display**:

- Circular progress (SVG)
- Color based on score (red < 5, yellow < 7, green >= 8)
- Animation: Animate from 0 to final score

#### Section 2: Issues List

```
┌──────────────────────────────────────┐
│  Issues Found: 5                     │
│                                      │
│  ⚠ HIGH - SQL Injection              │
│  Line 45: query = "SELECT * FROM..." │
│  [View Code] [Fix] [Dismiss]        │
│                                      │
│  ⚠ MEDIUM - Missing Error Handling  │
│  Line 67: result = await fetch()     │
│  [View Code] [Fix]                  │
│                                      │
│  ✓ PASS - Code Quality OK           │
│  Score: 8.2/10                       │
└──────────────────────────────────────┘
```

**Issue Card Styling**:

- Left border (color by severity)
- Severity badge
- Title and line number
- Action buttons

#### Section 3: AI Chat

```
┌──────────────────────────────────────┐
│  Ask AI About This Code             │
│                                      │
│  User: "Why is this slow?"           │
│                                      │
│  AI: "This has N+1 query problem.    │
│       You're querying in a loop.     │
│       Solution: Use JOIN instead"    │
│                                      │
│  [Input] Ask follow-up...            │
└──────────────────────────────────────┘
```

**Chat Styling**:

- User messages: Right-aligned, primary color
- AI messages: Left-aligned, secondary
- Code blocks: Monospace with syntax highlighting
- Input: Bottom sticky

---

### 3.4 Analytics Page

**Charts**:

- Line chart: Bugs over time
- Bar chart: Issues by type
- Pie chart: Issues by severity
- Heat map: Code quality trend

**Using**: Recharts library

---

## 4. Component Library

### 4.1 Reusable Components (shadcn/ui)

```
Button
  - Primary (gradient fill)
  - Secondary (outline)
  - Danger (red)
  - Animated hover

Card
  - With border
  - With shadow
  - Hover effects

Badge
  - For statuses
  - For labels
  - Color variants

Input
  - Text input
  - Textarea
  - File upload

Modal
  - Form modals
  - Confirmation dialogs

Toast
  - Success/error notifications
```

### 4.2 Custom Components

```
CodeEditor (Monaco)
  - Syntax highlighting
  - Line numbers
  - Theme: Dark

IssueCard
  - Issue display
  - Severity indicator
  - Actions

ScoreCard
  - Score display
  - Progress ring

AgentFlow
  - Agent workflow visualization
  - Using react-flow

CodeDiff
  - Before/after comparison
```

---

## 5. Animations & Interactions

### 5.1 Page Transitions

- Fade in: 300ms
- Slide up: 400ms
- Stagger: 100ms between elements

### 5.2 Hover Effects

- Button hover: Scale 1.05 + glow
- Card hover: Border color change + shadow
- Link hover: Underline + color change

### 5.3 Loading States

- Skeleton screens for data
- Spinner during analysis
- Progress bar for uploads

### 5.4 Success States

- Checkmark animation
- Toast notification
- Visual feedback

---

## 6. Responsive Design

### Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Mobile Adaptations

- Hero: Stack vertical
- Cards: 1 column
- Navigation: Hamburger menu
- Features: Carousel
- Pricing: Vertical stack

---

## 7. Dark Mode

**Implementation**: CSS variables + Tailwind dark mode

```css
:root {
  --color-primary: #6366f1;
  --color-secondary: #1e293b;
  --color-text: #f1f5f9;
  --color-border: #334155;
}

@media (prefers-color-scheme: light) {
  :root {
    --color-secondary: #f1f5f9;
    --color-text: #0f172a;
    --color-border: #e2e8f0;
  }
}
```

**Page**: Always dark mode by default (tech-forward audience)

---

## 8. Accessibility

### WCAG 2.1 AA Compliance

- [ ] Color contrast ratio 4.5:1
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Focus indicators (visible)
- [ ] Alt text on images
- [ ] Screen reader tested

### Testing Tools

- axe DevTools
- WAVE
- Lighthouse

---

## 9. Performance Optimization

### Images

- Use WebP with fallback
- Lazy loading
- Responsive images (srcset)

### Code Splitting

- Route-based splitting with Next.js
- Component lazy loading

### Caching

- Browser cache headers
- Service worker (PWA)

---

## 10. Vibe IDE Prompt (Copy-Paste Ready)

```
Create a modern AI SaaS landing page and dashboard for "CodeGuardian AI" -
an AI code review platform.

HERO SECTION:
- Left side: Large typography headline "AI Code Review That Never Misses Bugs"
  with description and two CTA buttons (Start Free Review, Watch Demo)
- Right side: Animated Monaco Editor mockup showing code with AI suggestions

DESIGN STYLE:
- Dark mode (Slate-950 background)
- Gradient primary: Purple (#6366F1) → Blue (#3B82F6)
- Modern developer audience aesthetic (Linear, Vercel, Cursor inspired)
- Use Framer Motion for animations

SECTIONS:
1. Sticky Navbar: Logo, nav links, login/signup buttons
2. Hero: Two-column layout as described
3. Trusted logos: Developer/company logos
4. Features: 3x2 grid of feature cards with hover effects
5. How It Works: 4-step timeline
6. AI Agents: Visual flow diagram showing multi-agent collaboration
7. Pricing: 3 tier cards (Free, Pro, Team) with feature comparison
8. Testimonials: Developer quotes carousel
9. Final CTA: Centered call-to-action
10. Footer: Links + copyright

DASHBOARD (Secondary):
- Sidebar navigation
- Metrics cards (Scans, Bugs, Score, Issues)
- Recent scans table
- Upload modal
- Results view with issues list and code chat

TECH STACK:
- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Recharts (for analytics)
- react-flow (for agent visualization)
- Monaco Editor (for code display)

COLORS:
- Primary: #6366F1 (purple)
- Secondary: #3B82F6 (blue)
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444
- Dark bg: #0F172A
- Card bg: #1E293B

Use glassmorphism for navbar, gradients for buttons,
and smooth transitions for all interactions.
```

---

## 11. UI Component Examples

### Button Component (TSX)

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded transition-all duration-200";

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg hover:shadow-indigo-500/50",
    secondary: "border border-slate-700 text-slate-300 hover:border-indigo-500",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${props.className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 12. Animation Examples (Framer Motion)

```tsx
import { motion } from "framer-motion";

export function HeroAnimation() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.h1 variants={itemVariants} className="text-5xl font-bold">
        AI Code Review
      </motion.h1>
      <motion.p variants={itemVariants}>That Never Misses Bugs</motion.p>
    </motion.div>
  );
}
```

---

## Conclusion

This design system creates a **premium, modern AI SaaS experience** that:

- ✅ Looks professional and trustworthy
- ✅ Feels smooth with intentional animations
- ✅ Scales responsively across devices
- ✅ Guides users intuitively through features
- ✅ Showcases AI capabilities visually

Ready to implement in Next.js with shadcn/ui and Framer Motion!
