"use client";

import { useLanguage } from "@/providers/language-provider";
import { Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.button
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      onClick={() => setLanguage(language === "en" ? "zh" : "en")}
      title={language === "en" ? "Switch to Chinese" : "切换到英文"}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Languages className="h-4 w-4 shrink-0" />
      <div className="relative h-4 overflow-hidden" style={{ width: "26px" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={language}
            className="absolute inset-0 flex items-center text-xs font-semibold"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {language === "en" ? "中文" : "EN"}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
