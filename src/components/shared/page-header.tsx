"use client";

import { motion } from "framer-motion";
import { fadeLeft, fadeRight } from "@/lib/animations";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <motion.div
        className="space-y-1"
        variants={fadeLeft}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <motion.p
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.4 }}
          >
            {description}
          </motion.p>
        )}
      </motion.div>

      {children && (
        <motion.div
          className="flex items-center gap-2"
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.08 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
