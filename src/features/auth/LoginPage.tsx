import { motion } from "framer-motion";
import React from "react";

import { BrandHeader } from "./components/BrandHeader";
import { LoginForm } from "./components/LoginForm";
import { SocialAuth } from "./components/SocialAuth";
import { useAuth } from "./hooks/useAuth";

import { ANIMATION_HOVER_SCALE, ANIMATION_TAP_SCALE } from "@/lib/constants";

export function LoginPage() {
  const {
    mode, setMode, email, setEmail, password, setPassword,
    name, setName, loading, error, setError, handleSubmit,
    handleGoogleSignIn, switchMode,
  } = useAuth();

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <BrandHeader />

        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl shadow-black/10 overflow-hidden">
          <ModeSwitcher mode={mode} setMode={setMode} setError={setError} />

          <LoginForm
            mode={mode} onSubmit={(e) => { void handleSubmit(e); }}
            loading={loading} error={error} name={name} setName={setName}
            email={email} setEmail={setEmail} password={password} setPassword={setPassword}
            hoverScale={ANIMATION_HOVER_SCALE} tapScale={ANIMATION_TAP_SCALE}
          />

          <div className="px-6 pb-6">
            <SocialAuth
              loading={loading} onGoogleSignIn={() => { void handleGoogleSignIn(); }}
              hoverScale={ANIMATION_HOVER_SCALE} tapScale={ANIMATION_TAP_SCALE}
            />
            <FooterSwitcher mode={mode} onSwitch={switchMode} />
          </div>
        </div>
        <TermsFooter />
      </motion.div>
    </div>
  );
}

function BackgroundElements() {
  const GRID_SIZE = "40px 40px";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: GRID_SIZE }} />
    </div>
  );
}

function ModeSwitcher({ mode, setMode, setError }: { mode: 'signin' | 'signup', setMode: (m: 'signin' | 'signup') => void, setError: (e: string | null) => void }) {
  return (
    <div className="flex border-b border-border/50">
      {(['signin', 'signup'] as const).map((tab) => (
        <button
          key={tab} onClick={() => { setMode(tab); setError(null); }}
          className={`flex-1 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all relative ${mode === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {tab === 'signin' ? 'Sign In' : 'Sign Up'}
          {mode === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
        </button>
      ))}
    </div>
  );
}

function FooterSwitcher({ mode, onSwitch }: { mode: 'signin' | 'signup', onSwitch: () => void }) {
  return (
    <div className="mt-6 text-center">
      <p className="text-[12px] text-muted-foreground">
        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={onSwitch} className="text-primary font-bold hover:underline">
          {mode === "signin" ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </div>
  );
}

function TermsFooter() {
  return <p className="text-center text-[10px] text-muted-foreground/50 mt-6">By continuing, you agree to our Terms of Service and Privacy Policy.</p>;
}
