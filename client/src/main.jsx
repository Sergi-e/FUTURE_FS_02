import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SocketProvider>
            <App />
          </SocketProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        className:
          "!bg-white !text-slate-900 !border !border-slate-200 dark:!bg-slate-900 dark:!text-white dark:!border-white/15",
      }}
    />
  </StrictMode>
);
