import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Newspaper } from "lucide-react";

const categories = ["All", "Release", "Update", "Event", "News"];

const cardAnim = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" } }),
};

const categoryColors: Record<string, string> = {
  Release: "bg-green-500/20 text-green-400 border-green-500/30",
  Update: "bg-accent/20 text-accent border-accent/30",
  Event: "bg-primary/20 text-primary border-primary/30",
  News: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const NewsPage = () => {
  const { news } = useAppStore();
  const [cat, setCat] = useState("All");

  const filtered = cat === "All" ? news : news.filter((n) => n.category === cat);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Newspaper className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 glow-text text-foreground">
          News & <span className="gradient-text">Announcements</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Stay in the loop with everything Memo Games
        </p>
      </motion.div>

      <motion.div
        className="flex gap-2 flex-wrap justify-center mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              cat === c ? "gradient-btn shadow-lg shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <motion.p
          className="text-center text-muted-foreground py-20 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No announcements found.
        </motion.p>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                className="glass-card p-6 neon-border group hover:border-primary/30"
                variants={cardAnim}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                custom={i}
                layout
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${categoryColors[item.category] || "bg-secondary text-muted-foreground border-border"}`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
