import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Home } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { authClient } from "@/lib/auth-client";


const ANIMATION_HOVER_SCALE = 1.01;
const ANIMATION_TAP_SCALE = 0.98;

// eslint-disable-next-line max-lines-per-function -- Page components bundle layout and cohesive logic
export function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
        });
        if (error) {
          // Generic message for all signup failures to prevent account enumeration
          setError("Sign up failed. Please check your details and try again.");
        } else {
          // After signup, redirect to email verification page
          // Do NOT log them in — they must verify email first
          void navigate("/verify-email");
        }
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) {
          // Always generic for sign-in to prevent enumeration.
          setError("Invalid email or password.");
        } else {
          // After signin, navigate to home (App.tsx handles role routing)
          void navigate("/");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
      });
      if (error) {
        setError(error.message || "Google sign in failed.");
      }
    } catch {
      setError("Something went wrong with Google sign in.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--background))] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
          >
            <Home className="w-7 h-7 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Roomet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find your perfect boarding house
          </p>
        </div>

        {/* Card */}
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl shadow-black/10 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-border/50">
            {(["signin", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMode(tab);
                  setError(null);
                }}
                className={`flex-1 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all relative ${
                  mode === tab
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "signin" ? "Sign In" : "Sign Up"}
                {mode === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={(e) => { void handleSubmit(e); }} className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-[12px] text-destructive font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); }}
                      placeholder="Juan Dela Cruz"
                      required={true}
                      className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); }}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); }}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-11 py-3 bg-muted/30 border border-border/50 rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => { setShowPassword(!showPassword); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Must be at least 8 characters
                </p>
              )}
              {mode === "signin" && (
                <div className="mt-1.5 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : ANIMATION_HOVER_SCALE }}
              whileTap={{ scale: loading ? 1 : ANIMATION_TAP_SCALE }}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[hsl(var(--card))] px-2 text-muted-foreground/50">Or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            <motion.button
              type="button"
              disabled={loading}
              onClick={() => { void handleGoogleSignIn(); }}
              whileHover={{ scale: loading ? 1 : ANIMATION_HOVER_SCALE }}
              whileTap={{ scale: loading ? 1 : ANIMATION_TAP_SCALE }}
              className="w-full py-3.5 bg-background border border-border/50 text-foreground rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/30 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </motion.button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-[12px] text-muted-foreground">
              {mode === "signin"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary font-bold hover:underline"
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
