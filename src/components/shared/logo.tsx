"use client";

import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 28, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* Background rounded square */}
        <rect width="32" height="32" rx="8" className="fill-primary" />
        
        {/* Chart bars */}
        <motion.rect
          x="6" y="18" width="4" height="8" rx="1.5"
          className="fill-primary-foreground"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          style={{ originY: 1, transformBox: "fill-box" }}
        />
        <motion.rect
          x="14" y="10" width="4" height="16" rx="1.5"
          className="fill-primary-foreground"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          style={{ originY: 1, transformBox: "fill-box" }}
        />
        <motion.rect
          x="22" y="6" width="4" height="20" rx="1.5"
          className="fill-primary-foreground"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          style={{ originY: 1, transformBox: "fill-box" }}
        />
        
        {/* Upward arrow accent */}
        <motion.path
          d="M8 16L16 8L24 4"
          className="stroke-primary-foreground/40"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
      </motion.svg>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm tracking-tight">TokoMetrics</span>
          <span className="text-[10px] font-medium text-primary tracking-widest">PRO</span>
        </div>
      )}
    </div>
  );
}
