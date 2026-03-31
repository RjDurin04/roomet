import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          name,
          email,
          password,
        });
        if (signUpError) {
          setError("Sign up failed. Please check your details and try again.");
        } else {
          void navigate("/verify-email");
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError("Invalid email or password.");
        } else {
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
      const { error: googleError } = await authClient.signIn.social({
        provider: "google",
      });
      if (googleError) {
        setError(googleError.message ?? "Google sign in failed.");
      }
    } catch {
      setError("Something went wrong with Google sign in.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(prev => prev === "signin" ? "signup" : "signin");
    setError(null);
  };

  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    loading,
    error,
    setError,
    handleSubmit,
    handleGoogleSignIn,
    switchMode,
  };
}
