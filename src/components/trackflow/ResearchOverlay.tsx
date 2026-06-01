import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  "Scraping website...",
  "Fetching news...",
  "Analysing job postings...",
  "Generating report...",
];

export function ResearchOverlay({ open, companyName, onDone }: { open: boolean; companyName: string; onDone?: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!open) { setIdx(0); return; }
    if (idx >= steps.length) { onDone?.(); return; }
    const t = setTimeout(() => setIdx((i) => i + 1), 900);
    return () => clearTimeout(t);
  }, [open, idx, onDone]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-4 sm:p-8"
          >
            <h2 className="text-center text-lg font-medium text-charcoal sm:text-xl">Researching {companyName}...</h2>
            <ul className="mt-8 space-y-4">
              {steps.map((s, i) => {
                const done = i < idx;
                const active = i === idx;
                return (
                  <motion.li
                    key={s}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: i <= idx ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="h-5 w-5 grid place-items-center">
                      {done && <Check className="h-4 w-4 text-gold" />}
                      {active && <Loader2 className="h-4 w-4 text-gold animate-spin" />}
                      {!done && !active && <span className="h-2 w-2 rounded-full bg-border" />}
                    </span>
                    <span className={done ? "text-charcoal" : active ? "text-charcoal" : "text-muted-foreground"}>{s}</span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
