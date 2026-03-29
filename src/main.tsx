import React, { Component } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string
);

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const isDev = import.meta.env.DEV;
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: '#e11d48', fontSize: 24, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
          {isDev && (
            <pre style={{ background: '#111', color: '#ef4444', padding: 16, borderRadius: 8, fontSize: 12, textAlign: 'left', overflow: 'auto', maxHeight: 400 }}>
              {this.state.error.stack ?? this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        <App />
      </ConvexBetterAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
