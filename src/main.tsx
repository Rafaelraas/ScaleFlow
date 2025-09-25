import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from "./providers/SessionContextProvider.tsx";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter here

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <SessionContextProvider>
      <App />
    </SessionContextProvider>
  </BrowserRouter>
);