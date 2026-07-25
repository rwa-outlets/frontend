---
name: Aetheric Outlets
colors:
  surface: '#0c150f'
  surface-dim: '#0c150f'
  surface-bright: '#323c34'
  surface-container-lowest: '#07100a'
  surface-container-low: '#141e17'
  surface-container: '#18221b'
  surface-container-high: '#232c25'
  surface-container-highest: '#2d3730'
  on-surface: '#dae5db'
  on-surface-variant: '#b9cbbd'
  inverse-surface: '#dae5db'
  inverse-on-surface: '#29332c'
  outline: '#849588'
  outline-variant: '#3a4a3f'
  surface-tint: '#00e290'
  primary: '#f5fff5'
  on-primary: '#003920'
  primary-container: '#00ffa3'
  on-primary-container: '#007146'
  inverse-primary: '#006d43'
  secondary: '#d1bcff'
  on-secondary: '#3c0090'
  secondary-container: '#7000ff'
  on-secondary-container: '#ddcdff'
  tertiary: '#fffbff'
  on-tertiary: '#3b2f00'
  tertiary-container: '#ffdd67'
  on-tertiary-container: '#766000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#52ffac'
  primary-fixed-dim: '#00e290'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005231'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d1bcff'
  on-secondary-fixed: '#23005b'
  on-secondary-fixed-variant: '#5700c9'
  tertiary-fixed: '#ffe17b'
  tertiary-fixed-dim: '#e4c451'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#564500'
  background: '#0c150f'
  on-background: '#dae5db'
  surface-variant: '#2d3730'
  surface-glass: rgba(255, 255, 255, 0.04)
  border-glass: rgba(255, 255, 255, 0.12)
  neon-cyan: '#00F0FF'
  deep-void: '#020408'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 80px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 2rem
  gutter: 1.5rem
  outlet-gap: 4rem
---

## Brand & Style
The design system embodies a "Futuristic Institutional" persona—a blend of high-finance reliability and cutting-edge Web3 innovation. It utilizes a **Glassmorphic** style inspired by Apple's spatial design language, emphasizing depth through transparency and blurred layers rather than traditional shadows. 

The primary metaphor is "The Outlet"—a clean, high-tech interface through which RWA (Real World Asset) liquidity flows. The emotional response is one of clarity, precision, and "weightless" sophistication. The UI feels like a head-up display (HUD), prioritizing high-density data visualizations wrapped in a sleek, frosted aesthetic.

## Colors
The palette is rooted in a **Dark Mode** foundation. The background is a near-black "Deep Void," providing the necessary contrast for neon accents and glass layers. 

- **Primary:** A vibrant "Spring Green" used for liquidity flow indicators, success states, and primary CTAs.
- **Secondary:** A "Electric Violet" for sophisticated technical accents and secondary interactive elements.
- **Glass System:** Instead of solid grays, the system uses varying opacities of white for surfaces and borders to create the "frosted" effect. 
- **Neon Accents:** Used sparingly as glow effects (box-shadow or text-shadow) to highlight active "Outlets" or critical data points.

## Typography
The typography system balances the warmth of **Manrope** for headlines with the utilitarian precision of **Inter** for body text. To lean into the "web3/technical" nature of the product, **JetBrains Mono** is utilized for metadata, transaction hashes, and status labels.

- **Headlines:** Use tight letter-spacing and heavy weights to create a commanding, institutional presence.
- **Data Points:** Should often be rendered in the headline font but with the primary color to draw immediate attention.
- **Responsive Scaling:** Headlines scale aggressively down for mobile to maintain readability within glass containers.

## Layout & Spacing
This design system utilizes a **Fixed Grid** on desktop (1440px max-width) to maintain the structural integrity of complex financial tables, transitioning to a **Fluid Grid** on tablet and mobile.

- **Rhythm:** An 8px base unit governs all dimensions.
- **Sectioning:** Large vertical "Outlet Gaps" (64px-128px) separate major content blocks, creating a sense of "flowing" through different liquidity channels.
- **Density:** High density within components (cards/tables) to maximize information display, offset by generous margins between major UI sections to prevent visual fatigue.

## Elevation & Depth
Depth is created through **Backdrop Blurs** rather than traditional Y-axis offsets.

1.  **Level 0 (Base):** The "Deep Void" background.
2.  **Level 1 (Cards/Containers):** `backdrop-filter: blur(20px)` with a 1px `border-glass` and a subtle inner glow.
3.  **Level 2 (Modals/Popovers):** Higher transparency, increased blur (40px), and a faint `neon-accent` outer glow to signify active focus.
4.  **The "Flow" Effect:** Linear gradients (Primary to Transparent) are used as "wires" or "pipes" connecting different components, reinforcing the "Outlet" metaphor.

## Shapes
The shape language is "Refined Geometric." A standard **0.5rem (8px)** radius is applied to most containers to feel modern yet structural. 

- **Interactive Elements:** Buttons and Input fields use a more pronounced **1rem (16px)** radius to make them distinct from layout containers.
- **Outlet Ports:** Specific decorative icons or connection points use perfect circles to represent the "plug-and-play" nature of the liquidity infrastructure.

## Components
- **Buttons:** Primary buttons use a solid `primary-color` with black text for maximum legibility. Secondary buttons are "Ghost" style with a glass border and a neon-hover state.
- **Liquidity Cards:** Use a frosted glass background. The top-right corner features an "Outlet Status" indicator—a small pulsing neon dot.
- **Input Fields:** Semi-transparent with a 1px border. On focus, the border glows with the `primary-color`.
- **Data Tables:** Horizontal rows are separated by thin glass dividers. The "Active Row" uses a subtle vertical neon stripe on the left edge.
- **Outlets:** A custom component representing a liquidity source, styled as a high-tech socket icon with animated "energy" flows when active.
- **Chips:** Small, pill-shaped labels with `label-mono` text, used for asset types (e.g., $USDC, $REALT) or transaction status.