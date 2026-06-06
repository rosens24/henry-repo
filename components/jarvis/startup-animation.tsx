"use client";

import { motion } from "framer-motion";

type StartupAnimationProps = {
  show: boolean;
};

export function StartupAnimation({ show }: StartupAnimationProps) {
  if (!show) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.35, duration: 0.55 }}
      aria-hidden="true"
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55 }}
      >
        <div className="mx-auto mb-5 size-24 rounded-full border border-amber-200/50 bg-amber-300/15 shadow-[0_0_70px_rgba(245,158,11,0.35)]" />
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-100">Henry IV is online</p>
      </motion.div>
    </motion.div>
  );
}
