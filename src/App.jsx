import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import PageWrapper from './components/layout/PageWrapper';
import ChatbotLauncher from './components/ui/ChatbotLauncher';
import './index.css';

/**
 * App Layout Shell
 * 
 * Provides the shared layout for all pages except the HomePage:
 * - Sidebar (left navigation, collapsible on mobile)
 * - TopBar (logo, theme toggle, wallet button)
 * - PageWrapper (Framer Motion page transitions)
 * 
 * Uses CSS Grid for layout structure
 */

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        <main className="main-content">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </main>
      </div>
      <ChatbotLauncher />
    </div>
  );
}

export default App;
