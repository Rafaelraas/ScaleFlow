import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './globals.css';
import { SessionContextProvider } from './providers/SessionContextProvider.tsx';
import { HashRouter } from 'react-router-dom'; // Using HashRouter for GitHub Pages compatibility
import { ThemeProvider } from './components/ThemeProvider'; // Import ThemeProvider
import { Analytics } from '@vercel/analytics/react';
import { initWebVitals } from './lib/web-vitals';

// Initialize Web Vitals tracking
initWebVitals();

// Check if running on Vercel (Vercel sets VERCEL env var to "1" during build)
const isVercel = import.meta.env.VITE_VERCEL === '1';

// HashRouter handles routing without server-side configuration
// This is the best practice for GitHub Pages static hosting
// URLs will use hash-based routing (e.g., /#/dashboard)
createRoot(document.getElementById('root')!).render(
  <HashRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionContextProvider>
        <App />
        {/* Only load Vercel Analytics when deployed on Vercel to avoid 404 errors on other platforms (e.g., GitHub Pages) */}
        {isVercel && <Analytics />}
      </SessionContextProvider>
    </ThemeProvider>
  </HashRouter>
);
