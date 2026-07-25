# Aetheric Outlets - Frontend

A **fully functional UI shell** for RWA Outlets (branded "Aetheric Outlets") - an instant-liquidity market for tokenized real-world assets built on 1inch Aqua + SwapVM.

## Features

- **Glassmorphic Design**: Futuristic Institutional style with frosted glass effects
- **Dark/Light Mode**: Theme toggle with auto-inversion for light mode
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Animated Components**: Framer Motion for smooth transitions and animations
- **Mock Data**: Realistic data based on architecture specifications

## Tech Stack

- **Framework**: React 18 + Vite 5
- **Routing**: react-router-dom v7
- **Animations**: Framer Motion
- **State Management**: React Context + Hooks
- **Styling**: CSS Custom Properties + Inline Styles
- **Glassmorphism**: Custom glass effect implementation

## Project Structure

```
frontend-1/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                # Entry point with router + theme provider
│   ├── App.jsx                 # Layout shell (sidebar/topbar + outlet)
│   ├── index.css               # Global styles + CSS custom properties
│   │
│   ├── theme/
│   │   ├── tokens.js           # JS token exports (dark + light palettes)
│   │   └── ThemeContext.jsx    # Dark/Light mode context + toggle hook
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx     # Navigation sidebar (glassmorphic)
│   │   │   ├── TopBar.jsx      # Top bar with logo, theme toggle, wallet button
│   │   │   └── PageWrapper.jsx # Framer Motion page transition wrapper
│   │   │
│   │   ├── ui/
│   │   │   ├── GlassCard.jsx   # Reusable frosted-glass card component
│   │   │   ├── Button.jsx      # Primary / Ghost / Danger button variants
│   │   │   ├── Chip.jsx        # Pill-shaped label (assets, status, pools)
│   │   │   ├── StatusDot.jsx   # Pulsing neon status indicator
│   │   │   ├── DataTable.jsx   # Glassmorphic data table with sorting
│   │   │   ├── InputField.jsx  # Semi-transparent input with glow focus
│   │   │   ├── Modal.jsx       # Level 2 elevation glassmorphic modal
│   │   │   └── ThemeToggle.jsx # Dark/Light mode toggle switch
│   │   │
│   │   └── home/
│   │       └── OutletSVG.jsx   # Animated outlet SVG component
│   │
│   ├── pages/
│   │   ├── HomePage.jsx        # Landing: full-screen animated outlet + hero text + CTA
│   │   ├── DashboardPage.jsx   # Overview: TVL, volume, pools, yield breakdown
│   │   ├── PoolsPage.jsx       # Pool listing with filter tabs
│   │   ├── PoolDetailPage.jsx  # Single pool: swap interface + stats + history
│   │   ├── QueuePage.jsx       # RedemptionQueue: create/manage requests
│   │   └── VaultPage.jsx       # CuratorVault: deposit/withdraw + positions
│   │
│   ├── data/
│   │   └── mockData.js         # Mock pools, assets, trades, vault positions
│   │
│   └── utils/
│       └── formatters.js       # Number/address/date formatting helpers
│
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

## Design System

### Colors
The palette features:
- **Primary**: Spring Green (#00ffa3) for liquidity flow, success states, CTAs
- **Secondary**: Electric Violet (#7000ff) for sophisticated accents
- **Neon Accents**: Cyan (#00F0FF), Green (#00ffa3), Gold (#ffdd67)
- **Glass System**: Transparent whites/blacks with varying opacities

### Typography
- **Headlines**: Manrope (700, 800)
- **Body**: Inter (400, 500)
- **Data/Monospace**: JetBrains Mono (500)

### Glassmorphism
- **Level 1**: Cards/containers with 20px blur
- **Level 2**: Modals/popovers with 40px blur
- **Elevation**: Created through backdrop blurs, not shadows

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

1. **Navigate to project directory**:
   ```bash
   cd D:\Documents\Others-hack\ETH-Lisbon\frontend-1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install required packages**:
   ```bash
   npm install react react-dom react-router-dom framer-motion liquid-glass-web-react
   ```

4. **Install dev dependencies**:
   ```bash
   npm install -D @vitejs/plugin-react vite eslint
   ```

### Running the Development Server

```bash
npm run dev
```

This will start the Vite development server on port 3000 and open the app in your browser.

### Building for Production

```bash
npm run build
```

This will create a production-ready build in the `dist/` directory.

### Verifying the Build

```bash
npm run preview
```

## Pages

### Home Page (`/`)
- Full-screen landing with animated outlet SVG
- Hero text and CTA buttons
- Particle/grid background effect
- Flow effect with gradient lines

### Dashboard (`/dashboard`)
- Total Value Locked (TVL) stat
- 24h Volume stat
- Active Pools stat
- Average APY stat
- Pool Summary cards (Express, Patient, Market)
- Recent Trades table
- Yield Breakdown visualization

### Pools (`/pools`)
- Filter tabs (All, Express, Patient, Market)
- Pool cards grid with stats
- "How Pools Work" expandable section

### Pool Detail (`/pools/:poolId`)
- Swap interface (Exit/Entry toggle)
- Pool stats panel
- Asset information
- Trade history table

### Redemption Queue (`/queue`)
- Create Request modal
- My Requests / All Requests tabs
- Queue Stats
- Claim functionality for claimable requests

### Vault (`/vault`)
- Tier selector tabs (Express/Patient)
- Deposit section
- My Position cards
- Vault Stats
- Active Pools under this vault

## Architecture Highlights

### Pool Types

1. **Express** (⚡)
   - High-liquidity, short-settlement RWAs
   - Instant USDC at NAV minus tight spread (5-25 bps)
   - Suitable for: T-bills, MMF shares

2. **Patient** (⏳)
   - Longer-dated, less liquid RWAs
   - Dutch-decay auction pricing (50-300 bps)
   - Suitable for: Private credit, real estate

3. **Market** (💱)
   - Two-sided constant-product AMM
   - Both exits and entries
   - 30 bps fee

### Yield Streams

1. **Redemption Spreads**: From instant exit discounts
2. **Capital Reuse**: From Aqua capital efficiency
3. **NAV Capture**: From inventory settlement at full NAV

### Curator Vaults

- One vault per risk tier
- LPs deposit USDC only
- Vault operates all mandate RWAs of its tier
- AI curator agent manages pool creation and rebalancing

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Browser Support

- Chrome (recommended for best glassmorphism rendering)
- Firefox
- Safari (partial backdrop-filter support)
- Edge

## Known Limitations

This is a **UI shell with mock data**. Smart contract integration is not yet implemented:

- Wallet connection is stubbed
- Trade execution is simulated
- Queue requests are mock data
- Vault deposits are simulated
- NAV oracle data is mock
- Curator agent is mock

These will be implemented in the next phase with actual smart contract integration.

## Design References

- [Architecture Document](Prompts/01-architecture.md)
- [Engine Spec](Prompts/02-engine-spec.md)
- [Contracts](Prompts/03-contracts.md)
- [Design System](design/DESIGN.md)
- [Home Page Design](design/code.html)
- [Animated SVG](design/animated_svg.html)

## License

MIT
