import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

interface LoginFormProps {
  mode: "signin" | "signup";
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | undefined | null;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  hoverScale: number;
  tapScale: number;
}

export function LoginForm({
  mode, onSubmit, loading, error, name, setName,
  email, setEmail, password, setPassword, hoverScale, tapScale,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <ErrorAlert error={error} />
      <NameField name={name} setName={setName} show={mode === "signup"} />
      <EmailField email={email} setEmail={setEmail} />
      <PasswordField
        password={password} setPassword={setPassword} showPassword={showPassword} 
        setShowPassword={setShowPassword} showHint={mode === "signup"} 
        showForgot={mode === "signin"} 
      />

      <motion.button
        type="submit" disabled={loading}
        whileHover={{ scale: loading ? 1 : hoverScale }}
        whileTap={{ scale: loading ? 1 : tapScale }}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors mt-2"
      >
        {loading ? <LoadingSpinner /> : <SubmitLabel mode={mode} />}
      </motion.button>
    </form>
  );
}

function ErrorAlert({ error }: { error: string | undefined | null }) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-[12px] text-destructive font-medium">
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NameField({ show, name, setName }: { show: boolean, name: string, setName: (n: string) => void }) {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Full Name</label>
      <div className="relative">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" required className="auth-input pl-10" />
      </div>
    </motion.div>
  );
}

function EmailField({ email, setEmail }: { email: string, setEmail: (e: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Email Address</label>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="auth-input pl-10" />
      </div>
    </div>
  );
}

function PasswordField({ password, setPassword, showPassword, setShowPassword, showHint, showForgot }: any) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} className="auth-input pl-10 pr-11" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showHint && <p className="text-[10px] text-muted-foreground mt-1.5">Must be at least 8 characters</p>}
      {showForgot && <div className="mt-1.5 text-right"><Link title="forgot password?" to="/forgot-password"  className="text-[11px] font-medium text-primary hover:underline">Forgot password?</Link></div>}
    </div>
  );
}

function SubmitLabel({ mode }: { mode: 'signin' | 'signup' }) {
  return (<>{mode === "signin" ? "Sign In" : "Create Account"}<ArrowRight className="w-4 h-4" /></>);
}

function LoadingSpinner() {
  return <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />;
}
