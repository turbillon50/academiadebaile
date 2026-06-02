---
name: Electric Kinetic
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c0c6d6'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#8b91a0'
  outline-variant: '#414754'
  surface-tint: '#aac7ff'
  primary: '#aac7ff'
  on-primary: '#003064'
  primary-container: '#3e90ff'
  on-primary-container: '#002957'
  inverse-primary: '#005db8'
  secondary: '#c2c1ff'
  on-secondary: '#1800a7'
  secondary-container: '#3630bf'
  on-secondary-container: '#b1b1ff'
  tertiary: '#47e266'
  on-tertiary: '#003910'
  tertiary-container: '#00a73e'
  on-tertiary-container: '#00320d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006b'
  on-secondary-fixed-variant: '#332dbc'
  tertiary-fixed: '#6cff82'
  tertiary-fixed-dim: '#47e266'
  on-tertiary-fixed: '#002106'
  on-tertiary-fixed-variant: '#00531a'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  status-pill:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  stack-gap: 16px
  glass-padding: 20px
  section-margin: 32px
  gutter: 12px
---

## Brand & Style

The brand personality is high-octane, elite, and disciplined, mirroring the physical rigor and artistic expression of professional dance. It targets an audience of ambitious students and instructors who value precision and "the flow." 

The visual style is a fusion of **Dark Minimalism** and **Glassmorphism**. By using a pure black canvas, the interface allows photography of movement to take center stage, while the "Electric Blue" accents provide a heartbeat of energy. This design system leverages translucent surfaces to create a sense of depth and modern sophistication, ensuring the PWA feels like a premium native application. The emotional goal is to make the user feel like they are entering a "stage" or a "studio" every time they open the app.

## Colors

The palette is anchored in **Absolute Black (#000000)** to maximize the OLED contrast ratio and provide a cinematic backdrop. 

- **Primary (Electric Blue):** Used for critical actions, active states, and highlighting movement.
- **Secondary (Indigo):** Used for subtle accents or secondary data visualizations.
- **Tertiary (Success Green):** Reserved exclusively for positive payment statuses and completed milestones.
- **Glass Surfaces:** Semi-transparent layers use a dark grey base with a high background blur (20px-40px) to maintain legibility while suggesting physical depth.
- **Typography:** Pure white for headings to ensure maximum impact, with light grey variants for secondary labels to manage information hierarchy.

## Typography

This design system utilizes **Geist** for display and labeling to provide a technical, sharp edge that feels "pro-tools" inspired. **Inter** is used for body copy to ensure effortless readability during quick interactions.

Typography scales are aggressive. Headlines use heavy weights and tight letter spacing to command attention. Data-heavy labels (like payment amounts) should use the Geist font to emphasize the numerical precision. On mobile, headlines should scale down slightly to avoid awkward wrapping, but maintain their "extra bold" character.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on vertical momentum. 

- **Mobile First:** The PWA is optimized for one-handed use, placing primary navigation in a fixed bottom bar. 
- **The "Stage" Layout:** Content is grouped into glassmorphic cards that span the full width of the container minus the safe-area margins (20px).
- **Rhythm:** A 4px/8px baseline grid is used. Sections are separated by 32px to allow the "black" space to act as a visual breather, preventing the UI from feeling cluttered. 
- **Reflow:** On tablets, the dashboard cards transition from a single-column stack to a 2-column masonry grid to utilize the horizontal real estate.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** rather than traditional drop shadows. 

1. **Level 0 (Base):** The #000000 background. Everything rests here.
2. **Level 1 (Cards):** Translucent surfaces with a `backdrop-filter: blur(20px)`. These have a 1px solid border at 10% white opacity to define their edges against the black background.
3. **Level 2 (Modals/Popovers):** Higher blur (40px) and a slightly lighter fill to indicate they are closer to the user.
4. **Interaction:** When a card is pressed, it should subtly scale down (98%) rather than casting a shadow, maintaining the "tactile glass" metaphor.

## Shapes

The shape language is "Hyper-Rounded." This softens the aggressive dark/high-contrast aesthetic, making the academy feel welcoming despite its "elite" look. 

- **Primary Container:** 1rem (16px) radius for all dashboard and event cards.
- **Buttons/Pills:** Full "Pill" shape for status indicators and primary CTAs to make them look like touch-friendly physical objects.
- **Imagery:** Dancers and event photos should always have rounded corners that match the parent container to maintain the cohesive "glass pane" aesthetic.

## Components

### Buttons
- **Primary:** Solid Electric Blue with white text. High contrast, pill-shaped.
- **Secondary:** Transparent with a 1px Electric Blue border.
- **Ghost:** White text, no background, used for "See all" or "Cancel" actions.

### Glass Cards (Dynamic Dashboard & Events)
- Must include a `1px` subtle top-down gradient border to simulate a light source from above.
- Event cards should use a background image with a dark-to-transparent linear gradient overlay so white text remains legible.

### Bottom Navigation
- Fixed at the bottom. The background must be the same blurred glass as cards.
- Icons use Electric Blue for the active state and a 40% white for inactive states.

### Status Indicators
- **Payment Success:** A Tertiary Green pill with "Paid" in Geist Bold.
- **Pending:** A subtle amber/yellow tint border glass pill.

### Input Fields
- Dark grey fill (#1C1C1E) with a subtle bottom-border highlight in Electric Blue when focused.
- Labels float above the field in Geist Bold 12px.