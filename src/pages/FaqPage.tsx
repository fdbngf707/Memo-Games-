import { HelpCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
};

const FaqPage = () => {
  const { faqs } = useAppStore();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold glow-text text-foreground mb-2">FAQ</h1>
        <p className="text-muted-foreground text-lg">Frequently Asked Questions</p>
      </motion.div>

      {faqs.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-muted-foreground text-lg mb-2">No FAQs yet.</p>
          <p className="text-muted-foreground text-sm">Check back soon!</p>
        </motion.div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              className="glass-card overflow-hidden neon-border hover:border-primary/30"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                <motion.span
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-muted-foreground text-sm px-5 pb-5 pt-1 border-t border-border leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqPage;
