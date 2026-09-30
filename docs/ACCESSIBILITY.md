# Loop Accessibility (A11y) Verification & QA Checklist

## Standards & Targets
- **WCAG 2.2 Level AA** compliance across all responsive states.
- High-Contrast Mode meeting **WCAG 2.2 Level AAA** for text contrast.
- Full screen reader compatibility (VoiceOver, TalkBack, NVDA).

## 1. Automated Testing Suite
- `eslint-plugin-jsx-a11y` enforced on all React / web components.
- `axe-core` integrated into web CI and unit tests (`jest-axe` / Playwright a11y checks).
- React Native testing queries utilizing accessibility roles (`getByRole`, `getByLabelText`).

## 2. Manual Verification Checklist

### Text Scaling & Reflow
- [ ] At **400% browser zoom** (320px viewport), content reflows smoothly with **no horizontal scrolling**.
- [ ] On mobile with **iOS Dynamic Type / Android Font Scale at maximum (200% - 300%)**, all medicine names, doses, and schedules remain fully visible and wrap without clipping.
- [ ] Buttons and touch targets expand naturally with text scaling.

### Contrast & Vision
- [ ] All text passes 4.5:1 contrast in standard Light and Dark modes.
- [ ] High Contrast mode verified with 7:1+ AAA contrast on all interactive elements.
- [ ] Status indicators always combine: **Color + Distinct Icon + Visible Text**.
- [ ] Windows High Contrast mode (`forced-colors: active`) and `prefers-contrast` respected.

### Keyboard & Focus
- [ ] Skip-to-content link present as first tabbable element.
- [ ] Visible, high-contrast `:focus-visible` outline on all interactive elements (3px solid).
- [ ] Logical tab sequence from top to bottom.
- [ ] Modals and slide-overs trap focus while open; `Escape` key closes dialogs and restores previous focus.

### Assistive Technology & Announcements
- [ ] Live regions configured:
  - `aria-live="polite"` for regular check-ins and member updates.
  - `aria-live="assertive"` reserved exclusively for overdue or missed medicine alerts.
- [ ] 10-second Undo button provided for all destructive or mistaken check-in taps.
- [ ] Text-to-Speech (TTS) functional and readable by native speech engines.
