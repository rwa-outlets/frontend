import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeContext';
import App from './App';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PoolsPage from './pages/PoolsPage';
import PoolDetailPage from './pages/PoolDetailPage';
import QueuePage from './pages/QueuePage';
import VaultPage from './pages/VaultPage';
import './index.css';

/**
 * Main Entry Point
 * 
 * Wraps the application with:
 * - ThemeProvider (dark/light mode context)
 * - BrowserRouter (react-router-dom v7)
 * - AnimatePresence for Framer Motion page transitions
 * 
 * Routes:
 * - / (HomePage) - Full-screen landing page without layout
 * - All other pages use the App layout (sidebar + topbar)
 */

// Animation wrapper component
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home page - full-screen without layout */}
        <Route path="/" element={<HomePage />} />
        
        {/* All other pages use the App layout */}
        <Route element={<App />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pools" element={<PoolsPage />} />
          <Route path="/pools/:poolId" element={<PoolDetailPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/vault" element={<VaultPage />} />
        </Route>
        
        {/* Catch-all route - redirect to dashboard */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </AnimatePresence>
  );
};

const Root = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
