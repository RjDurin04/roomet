import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Search, Building2, ArrowRight, Home } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../../convex/_generated/api";

import { authClient } from "@/lib/auth-client";

type Role = "viewer" | "owner";

// eslint-disable-next-line max-lines-per-function -- Page components bundle layout and cohesive logic
export function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const setRole = useMutation(api.users.setRole);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      await setRole({ role: selectedRole });
      
      // Force session refresh to catch the new role if needed
      await authClient.getSession();
      
      // Route based on role
      if (selectedRole === "owner") {
        void navigate("/owner");
      } else {
        void navigate("/tenant");
      }
    } catch (error) {
      console.error("Failed to set role:", error);
      // In a real app we'd show a toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--background))] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[600px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
          >
            <Home className="w-7 h-7 text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-foreground tracking-tight mb-3"
          >
            Welcome to Roomet
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[15px] text-muted-foreground"
          >
            How do you plan to use the app?
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <RoleCard
            title="I'm looking for a room"
            description="Find dorms, bedspaces, and apartments."
            icon={<Search className="w-8 h-8" />}
            selected={selectedRole === "viewer"}
            onClick={() => { setSelectedRole("viewer"); }}
            delay={0.4}
          />
          <RoleCard
            title="I'm a property owner"
            description="List and manage your boarding houses."
            icon={<Building2 className="w-8 h-8" />}
            selected={selectedRole === "owner"}
            onClick={() => { setSelectedRole("owner"); }}
            delay={0.5}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => { void handleContinue(); }}
            disabled={!selectedRole || loading}
            className={`w-full py-4 rounded-xl text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
              selectedRole && !loading
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/95 translate-y-0"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function RoleCard({ 
  title, 
  description, 
  icon, 
  selected, 
  onClick,
  delay 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  selected: boolean; 
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      onClick={onClick}
      className={`relative text-left p-6 rounded-2xl border transition-all duration-300 overflow-hidden ${
        selected
          ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
          : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5"
      }`}
    >
      {selected && (
        <motion.div
          layoutId="role-outline"
          className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {icon}
      </div>
      <h3 className={`text-base font-bold mb-2 transition-colors ${
        selected ? "text-foreground" : "text-foreground/80"
      }`}>
        {title}
      </h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        {description}
      </p>
      
      {/* Decorative circle */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl transition-opacity duration-500 ${
        selected ? "bg-primary/20 opacity-100" : "opacity-0"
      }`} />
    </motion.button>
  );
}
