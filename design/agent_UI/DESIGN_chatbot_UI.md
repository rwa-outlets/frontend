---
name: Neon Glass
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#b9cbbb'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#849586'
  outline-variant: '#3b4b3e'
  surface-tint: '#00e383'
  primary: '#f2fff1'
  on-primary: '#00391d'
  primary-container: '#00ff94'
  on-primary-container: '#00713f'
  inverse-primary: '#006d3c'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#fffbf9'
  on-tertiary: '#3c2f00'
  tertiary-container: '#ffdc71'
  on-tertiary-container: '#775f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#5bffa1'
  primary-fixed-dim: '#00e383'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#00522c'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffe085'
  tertiary-fixed-dim: '#e5c45b'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
  glass-surface-high: rgba(255, 255, 255, 0.20)
  glass-surface-low: rgba(255, 255, 255, 0.05)
  glass-border: rgba(255, 255, 255, 0.30)
  glass-inset: rgba(255, 255, 255, 0.10)
  neon-glow: rgba(0, 255, 148, 0.40)
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1200px
---

## Brand & Style

This design system embodies a futuristic, high-tech persona designed for cutting-edge communication. The aesthetic is rooted in **Glassmorphism**, leveraging high-contrast visuals to create a sense of depth and digital sophistication. It targets a tech-savvy audience that values speed, energy, and precision.

The emotional response should be one of "electric" clarity. By pairing a deep, absolute black void with vibrant neon accents and translucent frosted layers, the UI feels like a luminous terminal floating in space. Every interaction should feel powered-on and reactive, moving away from static corporate layouts toward a dynamic, energy-infused environment.

## Colors

The color palette is built on a "Void and Glow" philosophy. The **neutral background** is absolute black (`#000000`) to maximize the perceived luminosity of the interface. 

The **primary accent** is a high-saturation Neon Green (`#00FF94`), used exclusively for interactive elements, status indicators, and critical call-to-actions. To maintain the glass effect, we utilize varying levels of white transparency:
- **High Transparency (20%)**: Used for the primary "shimmer" or top-left gradient of glass panels.
- **Low Transparency (5%)**: The base fill for large glass surfaces.
- **Border Transparency (30%)**: Used for crisp, structural outlines.
- **Inset Transparency (10%)**: Used to create "hollowed out" areas like input fields or message wells.

## Typography

Typography follows a hierarchy of "Geometrical High-Tech." **Sora** is used for headlines to provide a bold, wide, and futuristic look. **Hanken Grotesk** serves as the primary body face, offering exceptional legibility with a clean, sharp finish. For technical data, timestamps, and metadata, **JetBrains Mono** provides a monospaced "code-like" feel that reinforces the developer-centric, technical brand.

Scale is aggressive; headlines should feel significant, while labels remain small and tight, often utilizing uppercase styling and tracking to mimic digital readouts.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop and a **Fluid Layout** for mobile. The spacing rhythm is based on a 4px base unit, ensuring all elements align to a technical grid.

- **Desktop**: 12-column grid, max-width of 1200px, 16px gutters.
- **Mobile**: Single column, 16px side margins.
- **Chat Layout**: The interface uses a "Split Glass" view. A fixed-width sidebar (280px) for conversations and a flexible main area for the active chat thread.

Spacing between message bubbles should be tight (4px) within the same sender group and larger (16px) between different senders to create clear visual clusters.

## Elevation & Depth

Elevation is not communicated through traditional drop shadows but through **optical stacking and backdrop blurs**. 

1.  **Base Layer**: Absolute black.
2.  **Surface Layer**: 5% white transparency with a `backdrop-filter: blur(12px)`.
3.  **Accent Layer**: Elements using the neon primary color should have a subtle outer glow (`box-shadow: 0 0 15px rgba(0, 255, 148, 0.4)`) to suggest they are light sources.
4.  **Borders**: All glass panels must have a 1px solid border (`rgba(255, 255, 255, 0.3)`). For extra depth, use a linear gradient on the border itself, running from top-left (more opaque) to bottom-right (more transparent).

## Shapes

The shape language is "Softened Industrial." Large containers like chat windows and sidebars use a 1rem (`rounded-lg`) radius. Interactive elements like buttons and input fields use a 0.5rem (`rounded-md`) radius. 

Message bubbles are asymmetrical: bubbles on the left (others) have a bottom-left sharp corner (0px), while bubbles on the right (self) have a bottom-right sharp corner, reinforcing the direction of the conversation.

## Components

### Buttons
- **Primary**: Solid `#00FF94` background with black text. On hover, increase the glow intensity.
- **Secondary**: Glass background (`20% opacity`) with `#00FF94` border and text.

### Input Fields
- Use the `glass-inset` style (`10% opacity`). 
- Borders should be subtle (`30% white`) until focused.
- **Focus State**: Border transitions to solid `#00FF94` with a soft neon glow.

### Message Bubbles
- **Recipient**: Glass surface (low opacity) with white text.
- **Sender**: Subtle tint of the primary color (`rgba(0, 255, 148, 0.1)`) with a more pronounced neon border on the right edge.

### Glass Panels
- All cards and panels must include `backdrop-filter: blur(20px)` and the `#glassGradient` (top-left shimmer).

### Animations
- Use the `plugIn` motion pattern for incoming messages: a 300ms `ease-out` transition that slides the message up 10px while fading from 0 to 1 opacity.
- Pulse animations (infinite alternate) should be applied to "Typing" indicators using the primary neon color.