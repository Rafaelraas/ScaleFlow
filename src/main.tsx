import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from "./providers/SessionContextProvider.tsx";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter aqui
import { ThemeProvider } from "./components/ThemeProvider"; // Import ThemeProvider

// Determine o caminho base dinamicamente.
// Para o GitHub Pages, VITE_APP_BASE_PATH será '/scaleflow/'.
// Para o desenvolvimento local ou Vercel, será '/'.
const basename = import.meta.env.VITE_APP_BASE_PATH || '/';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basename}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionContextProvider>
        <App />
      </SessionContextProvider>
    </ThemeProvider>
  </BrowserRouter>
);