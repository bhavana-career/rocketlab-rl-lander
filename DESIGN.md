---
name: RocketLab Field Notes
colors:
  surface: '#fbf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fbf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#eae8e2'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c18'
  on-surface-variant: '#464741'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f3f1eb'
  outline: '#777771'
  outline-variant: '#c7c7bf'
  surface-tint: '#5f5e5c'
  primary: '#040404'
  on-primary: '#ffffff'
  primary-container: '#1e1e1c'
  on-primary-container: '#878683'
  inverse-primary: '#c8c6c3'
  secondary: '#a8380f'
  on-secondary: '#ffffff'
  secondary-container: '#fd7549'
  on-secondary-container: '#661a00'
  tertiary: '#000702'
  on-tertiary: '#ffffff'
  tertiary-container: '#012411'
  on-tertiary-container: '#6a8e73'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2de'
  primary-fixed-dim: '#c8c6c3'
  on-primary-fixed: '#1c1c1a'
  on-primary-fixed-variant: '#474744'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59e'
  on-secondary-fixed: '#3a0b00'
  on-secondary-fixed-variant: '#852400'
  tertiary-fixed: '#c5eccd'
  tertiary-fixed-dim: '#a9d0b2'
  on-tertiary-fixed: '#00210e'
  on-tertiary-fixed-variant: '#2c4e37'
  background: '#fbf9f3'
  on-background: '#1b1c18'
  surface-variant: '#e4e2dd'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the ethos of a high-rigor research institution: an archival field notebook meets an aerospace telemetry monitor. Rather than leaning into the neon-lit, hyper-saturated cliches of generic AI dashboards or dark-mode developer tools, it treats machine learning research as an empirical natural science.

The visual tone is calm, academic, and deliberate. Surfaces evoke heavy, high-grade uncoated paper stock. Typography balances editorial classicism with exact instrument readouts. The interface avoids aggressive visual noise, relying instead on razor-thin demarcations, explicit annotations, disciplined tabular layouts, and purposeful moments of scientific focus. Interactivity feels measured and authoritative—resembling ink drafted carefully onto archival vellum.

## Colors

The palette is rooted in low-strain, high-legibility earth tones and scientific print media:

- **Base Canvas (`#F7F5EF`)**: Warm ivory foundation simulating archival document stock, mitigating eye fatigue during long observational sessions.
- **Surface Elevation (`#EFECE4`, `#FBF9F4`)**: Recessed data wells and elevated instrument plates defined through tonal warmth rather than heavy shadows.
- **Primary Ink (`#1E1E1C`)**: Deep matte charcoal, offering crisp, high-contrast readability without the harsh synthetic edge of pure black.
- **Secondary Slate (`#5A5955`)**: Weathered slate-charcoal reserved for metadata, mathematical labels, column keys, and contextual footnotes.
- **Structural Hairlines (`#DDD9CE`)**: Warm grey line work for dividing telemetry grids, framing modules, and drawing axes.
- **Signal Accents**:
  - **Burnt Orange (`#D85A30`)**: Used with extreme parsimony for terminal actions, critical state changes, and primary focal telemetry.
  - **Nominal Sage (`#486B52`)**: Muted botanical green denoting convergent reward trajectories, stable descent corridors, and successful touch-downs.
  - **Anomaly Amber (`#B85D19`)**: Deep rust-amber flagging reward-hacking loops, gimbal saturation, and objective divergence.

## Typography

The typographic hierarchy establishes clear conceptual domains:

1. **The Editorial Voice (`Newsreader`)**: Expressive, historical, and intellectual. Applied to paper titles, experiment synopses, hypotheses, and high-level section narratives. It communicates that every run is part of a larger ongoing thesis.
2. **The Analytical Voice (`Inter`)**: Neutral, transparent, and functional. Applied to UI controls, tooltips, long-form parameter descriptions, and structural table headers.
3. **The Instrument Voice (`JetBrains Mono`)**: Strict, tabular, and metric-driven. Sized down and spaced out for hardware outputs, step counts, policy losses, loss gradients, timestamp coordinates, and runtime telemetry. All numerical data displays must utilize tabular lining figures (`tnum`).

## Layout & Spacing

Layouts adhere to an asymmetric editorial grid reminiscent of scientific journals and technical manuals:

- **Desktop (12 Columns)**: Configured with generous outer canvas margins (`3rem`) and crisp `1.5rem` gutters. The page layout typically pairs a narrow 3-column metadata or index sidebar with an expansive 9-column empirical canvas (charts, vector traces, reward decomposition graphs).
- **Mobile (4 Columns)**: Drops gracefully to a consolidated vertical stack with `1.25rem` margins and `1rem` gutters. Scientific data switches from side-by-side comparison tables to horizontally swipeable tape-readers or modular cards.
- **Hairline Framing**: Structural columns and content modules are separated by explicit `1px` continuous borders in `#DDD9CE`. Where primary layout sections intersect, incorporate subtle visual registration marks or crosshair indicators (`+`) in `#5A5955` to reinforce the scientific instrumentation theme.

## Elevation & Depth

This system intentionally rejects synthetic drop shadows, glossy blurs, and skeuomorphic depth. Depth is defined through planar tonal layering and mechanical boundaries:

- **Ground Layer**: Base page canvas rendered in `#F7F5EF`.
- **Level 1 (Notebook Plaque)**: Primary modules and experiment cards rendered in `#FBF9F4` or `#EFECE4`, bounded by a sharp `1px` hairline in `#DDD9CE`.
- **Level 2 (Recessed Telemetry Wells)**: Embedded terminal views, trajectory replay windows, and vector displays set directly into `#EFECE4` with an inner inset boundary.
- **Overlays & Dialogs**: Hover inspectors, contextual inspect flyouts, and modal dialogues share the `#FBF9F4` surface with an assertive `1px` `#1E1E1C` hairline border and an offset hard drop shadow (`2px 2px 0px rgba(30, 30, 28, 0.08)`). No soft diffuse shadows.

## Shapes

The geometric rule for this system is strict and uncompromising: **Zero Radius (`0px`)**.

All container edges, action buttons, inspection tags, metric displays, and data panels terminate in precise 90-degree orthogonal corners. This reinforces the precision of architectural diagrams, technical paper reprints, and scientific computing terminals. Rounded forms are strictly reserved for circular scalar readouts, trajectory vector paths, and status dot indicators.

## Components

### Buttons & Trigger Controls
- **Primary Action**: Solid `#1E1E1C` fill with `#F7F5EF` monospace text, squared corners, and `1px` border matching the fill. Hover transitions to `#D85A30` background with instantaneous feedback (no ease-out lag).
- **Secondary / Outline Action**: Transparent background, `1px` solid `#DDD9CE` border, and `#1E1E1C` text. Hover shifts border and text to `#1E1E1C`.
- **Ghost / Utility Action**: Transparent background with secondary text `#5A5955`. Hover shows an underline and `#1E1E1C` text.

### Badges, Status Chips & Flags
- Monospace font (`10px` / `label-caps`), squared corners, padding `2px 6px`.
- **Nominal State (e.g., Safe Touchdown)**: Background `#486B52` at 10% opacity, text `#486B52`, hairline `#486B52` at 30%.
- **Pathological State (e.g., Reward Hacking / Thruster Spin)**: Background `#B85D19` at 10% opacity, text `#B85D19`, hairline `#B85D19` at 30%.
- **Step / Episode Counter**: Background `#EFECE4`, text `#5A5955`, hairline `#DDD9CE`.

### Data Cards & Experiment Containers
- Crisp flat rectangles surfaced in `#FBF9F4` with a `1px` border of `#DDD9CE`.
- Each card features an optional header band with a `1px` bottom border containing the module title in `Newsreader` and a step or run index in `JetBrains Mono`.
- Corner registration marks (`+` or `L`-brackets) can punctuate cards hosting real-time canvas simulations.

### Input Fields & Parameter Steppers
- Background of `#F7F5EF` or `#FFFFFF`, framed with `1px` `#DDD9CE`.
- Focus state: border turns into `#1E1E1C` without outline rings or glow effects.
- Hyperparameter controls display their numerical value in `JetBrains Mono` accompanied by a minimal slide rule or increment tick marks.

### Telemetry Tables & Run Logs
- Dense tabular structures with subtle horizontal hairlines (`#DDD9CE`). No vertical row stripes.
- Column headers set in `JetBrains Mono` uppercase with `label-caps` styling and muted slate color (`#5A5955`).
- Numerical cells formatted to fixed decimal places, aligned to the right for rapid vertical scanning.

### Trajectory / Replay Viewport
- Dedicated simulation canvas framed by an outer rule with crosshairs at the four compass points.
- Overlaid flight coordinate readouts (Altitude, Velocity Vector, Fuel Consumption, Attitude Error) floated in minimal semi-opaque ivory HUD blocks.