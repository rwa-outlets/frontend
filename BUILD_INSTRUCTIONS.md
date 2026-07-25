# Build Instructions for RWA Outlets Frontend

## Quick Start

To get the frontend running:

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all dependencies listed in `package.json`:
- react
- react-dom
- react-router-dom
- framer-motion
- liquid-glass-web-react
- Development dependencies (vite, eslint, etc.)

### 2. Run the Development Server

```bash
npm run dev
```

This starts the Vite development server on port 3000 and opens the app in your default browser.

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Alternative Installation Methods

### If npm install fails:

Install dependencies individually:

```bash
npm install react@18.2.0 react-dom@18.2.0
npm install react-router-dom@7.0.0
npm install framer-motion@11.0.0
npm install liquid-glass-web-react@1.0.0
npm install -D @vitejs/plugin-react@4.2.0 vite@5.0.0
npm install -D eslint@8.55.0 eslint-plugin-react@7.33.2 eslint-plugin-react-hooks@4.6.0 eslint-plugin-react-refresh@0.4.5
```

### Using yarn:

```bash
yarn install
yarn dev
```

### Using pnpm:

```bash
pnpm install
pnpm dev
```

## Verification Checklist

Once the app is running, verify all features work correctly:

### ✅ Layout & Navigation
- [ ] Sidebar appears on the left with navigation links
- [ ] Top bar appears with logo, theme toggle, and wallet button
- [ ] Navigation between pages works (click sidebar links)
- [ ] Active page is highlighted in the sidebar

### ✅ Home Page (`/`)
- [ ] Full-screen landing page (no sidebar/topbar)
- [ ] Animated outlet SVG renders in the center
- [ ] Plug-in animation works
- [ ] Hero text "RWA Outlets" appears
- [ ] Subtitle appears
- [ ] "Enter App" button navigates to /dashboard
- [ ] "Learn More" button works
- [ ] Particle/grid background effect is visible
- [ ] Flow effect (gradient lines) is visible

### ✅ Theme Toggle
- [ ] Theme toggle switch is visible in top bar
- [ ] Clicking it switches between dark and light mode
- [ ] All colors update correctly
- [ ] Glassmorphic effects work in both modes
- [ ] Preference persists on page refresh

### ✅ Dashboard Page (`/dashboard`)
- [ ] 4 stat cards appear at the top (TVL, Volume, Active Pools, APY)
- [ ] Pool Summary cards appear (Express, Patient, Market)
- [ ] Recent Trades table appears with data
- [ ] Yield Breakdown section appears with progress bars
- [ ] All animations work on page load

### ✅ Pools Page (`/pools`)
- [ ] Filter tabs work (All, Express, Patient, Market)
- [ ] Pool cards grid appears
- [ ] Each card shows pool name, type, stats
- [ ] "How Pools Work" section is expandable
- [ ] Clicking a pool card navigates to pool detail

### ✅ Pool Detail Page (`/pools/:poolId`)
- [ ] Swap interface appears with Exit/Entry toggle
- [ ] Input fields work (You Send, You Receive)
- [ ] Calculations update when entering amounts
- [ ] Pool stats panel appears on the right
- [ ] Asset information appears
- [ ] Trade history table appears
- [ ] "Queue Instead" button appears for non-market pools

### ✅ Queue Page (`/queue`)
- [ ] Tabs work (My Requests, All Requests, Queue Stats)
- [ ] "Create Request" button opens modal
- [ ] Create Request modal has asset selection
- [ ] Create Request modal has amount input
- [ ] Request table shows data
- [ ] Status indicators work (Pending, Claimable, Claimed)
- [ ] Claim button works for claimable requests

### ✅ Vault Page (`/vault`)
- [ ] Tier selector tabs work (Express, Patient)
- [ ] Deposit section appears with stats
- [ ] "Deposit USDC" button opens modal
- [ ] My Position cards appear
- [ ] Vault Stats cards appear
- [ ] Active Pools under this vault appear

### ✅ Responsive Design
- [ ] Test on desktop (1440px+)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on mobile (375px - 768px)
- [ ] Sidebar collapses on mobile
- [ ] Hamburger menu appears on mobile
- [ ] All content remains usable on small screens
- [ ] Tables scroll horizontally on mobile

### ✅ Glassmorphism Effects
- [ ] Cards have frosted glass appearance
- [ ] Modals have backdrop blur
- [ ] Level 1 and Level 2 elevation differences are visible
- [ ] Neon glow effects work on active elements

### ✅ Animations
- [ ] Page transitions work (smooth fade + slide)
- [ ] Button hover effects work
- [ ] Outlet SVG animation works
- [ ] Progress bars animate
- [ ] Staggered animations work on page load

## Troubleshooting

### "npm install" fails with ENOENT error

Make sure you're in the correct directory:
```bash
cd D:\Documents\Others-hack\ETH-Lisbon\frontend-1
```

Then run:
```bash
npm install
```

### Dependencies not found

If you get errors about missing packages after running `npm install`, try:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Vite dev server won't start

Try deleting the `node_modules/.vite` directory:
```bash
rm -rf node_modules/.vite
npm run dev
```

### Glassmorphism effects not working

- Make sure you're using Chrome or Firefox
- Safari has partial support for `backdrop-filter`
- The effects may not be visible on all browsers

### Animations not working

Make sure Framer Motion is installed:
```bash
npm install framer-motion@11.0.0
```

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended for development |
| Firefox | ✅ Full | Works great |
| Safari | ⚠️ Partial | `backdrop-filter` has limited support |
| Edge | ✅ Full | Based on Chromium |

## Performance Tips

For best performance during development:

1. Use Chrome with hardware acceleration enabled
2. Close unnecessary browser tabs
3. Use `npm run dev` (not `npm start`)
4. The Vite dev server provides instant hot module replacement

## Production Deployment

To deploy to production:

1. Build the app:
```bash
npm run build
```

2. The production files will be in the `dist/` directory

3. Deploy the `dist/` directory to your web server:
   - Static hosting (Netlify, Vercel, GitHub Pages)
   - Nginx / Apache
   - Cloud storage (S3, Firebase Hosting)

4. Make sure your server serves `index.html` for all routes (for client-side routing to work)

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## File Structure Summary

All source files are in the `src/` directory:
- `main.jsx` - Entry point
- `App.jsx` - Layout shell
- `index.css` - Global styles
- `theme/` - Theme management
- `components/` - Reusable components
- `pages/` - Page components
- `data/` - Mock data
- `utils/` - Utility functions

## Next Steps

After the UI is working, you can:

1. **Add wallet connection**: Replace the stubbed "Connect Wallet" button with wagmi or RainbowKit
2. **Integrate smart contracts**: Connect to the actual RWA Outlets contracts
3. **Add real data**: Replace mock data with data from The Graph subgraph
4. **Add error handling**: Implement proper error states and messages
5. **Add loading states**: Show loading indicators for async operations
6. **Add unit tests**: Test components and utilities
7. **Optimize performance**: Lazy load components, code split, etc.

## Support

For issues with:
- **Dependencies**: Check npm registry status, try clearing cache
- **Vite**: Check Vite documentation, ensure Node.js version is 18+
- **React**: Check React documentation, ensure version compatibility
- **Framer Motion**: Check Framer Motion documentation
- **Browser compatibility**: Check Can I Use for CSS features
