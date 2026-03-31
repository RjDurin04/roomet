import { motion } from "framer-motion";
import { Home } from "lucide-react";

export function BrandHeader() {
  return (
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
  );
}
