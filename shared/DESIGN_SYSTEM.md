# Loop Design System & Accessibility Specification

## Core Philosophy
Loop is built for real human lives, specifically ensuring that **elderly individuals, caregivers, and accessibility-reliant users** experience zero friction, confusion, or visual strain, while maintaining a refined, modern design for all users.

## 1. Contrast & Color Tokens
- All color combinations adhere strictly to **WCAG 2.2 AA (minimum 4.5:1 for normal text, 3:1 for large text/icons)**.
- High-Contrast mode guarantees **AAA (7:1+ body text contrast, reaching 21:1 for primary text)**.
- Never convey state through color alone:
  - **Taken / Done**: Green background + Checkmark Icon + Visible Text label ("Taken" / "Done")
  - **Due / Pending**: Amber background + Clock Icon + Visible Text label ("Due")
  - **Missed**: Red background + Alert Icon + Visible Text label ("Missed")
  - **Skipped**: Gray background + Dash/Cross Icon + Visible Text label ("Skipped")

## 2. Touch & Click Targets
- Standard buttons and clickable cards: Minimum **48x48 CSS px / dp**.
- Primary Check-in Buttons ("Taken", "Done"): Minimum **64px height**, full width, rounded with active press animations.
- Spacing between adjacent touch targets: Minimum **8px**.

## 3. Typography & Scalability
- Default body text size is set to **18px (1.125rem)** for optimal readability.
- Fluid typography and layout reflow without horizontal scrolling down to **320px width** and up to **400% browser zoom**.
- React Native honors `PixelRatio.getFontScale()` and Dynamic Type up to `3.0x` without truncation. Critical information (medicine names, dose, time) always wraps, never truncates.

## 4. Elderly / Simple Patient Mode
- Single card per due item with large readable text:
  1. Medicine / Habit Title (24px - 30px)
  2. Dosage & Time (20px)
  3. Giant single-tap "Taken" button (64px+ height)
  4. Secondary "Skip" action with confirmation
- 10-second forgiving **Undo** action on every check-in.
- One-tap Emergency contact info accessible from all screens.
- Optional Text-to-Speech (TTS) screen prompt: "Time to take your blue pill, 500 milligrams".
