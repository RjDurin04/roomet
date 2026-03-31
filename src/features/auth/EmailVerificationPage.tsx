import { motion } from "framer-motion";
import { Mail, ArrowLeft, RefreshCw, Home, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { authClient } from "@/lib/auth-client";


// eslint-disable-next-line max-lines-per-function -- Page components bundle layout and cohesive logic
export function EmailVerificationPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    setResending(true);
    try {
      const { error: sendError } = await authClient.sendVerificationEmail({
        email: "", // Better Auth uses the current session's email
        callbackURL: "/",
      });
      if (sendError) {
        setError("Could not resend. Please try again later.");
      } else {
        setResent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--background))] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
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
        </div>

        {/* Card */}
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl shadow-black/10 overflow-hidden p-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-5"
          >
            <Mail className="w-8 h-8 text-primary" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-foreground mb-2"
          >
            Check your email
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[13px] text-muted-foreground leading-relaxed mb-6"
          >
            We've sent a verification link to your email address. Click the link
            to verify your account and get started.
          </motion.p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-[12px] text-destructive font-medium mb-4">
              {error}
            </div>
          )}

          {resent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-[13px] text-green-500 font-medium mb-4"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verification email resent!
            </motion.div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-2 text-[13px] font-bold text-primary hover:underline disabled:opacity-50 mb-4"
            >
              {resending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Resend verification email
            </button>
          )}

          <div className="border-t border-border/50 pt-4 mt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          Didn't receive the email? Check your spam folder.
        </p>
      </motion.div>
    </div>
  );
}
