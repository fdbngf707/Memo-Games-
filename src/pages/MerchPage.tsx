import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/lib/store";

const cardAnim = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" } }),
};

const MerchPage = () => {
  const { merch } = useAppStore();

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 glow-text">
          Merch <span className="gradient-text">Store</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Rep Memo Games with official merchandise
        </p>
      </motion.div>

      {merch.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-muted-foreground text-lg mb-2">No merchandise available yet.</p>
          <p className="text-muted-foreground text-sm">Check back soon for exclusive drops!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {merch.map((item, i) => (
            <motion.div
              key={item.id}
              className="glass-card overflow-hidden group hover:border-primary/30 neon-border"
              variants={cardAnim}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              {item.imageUrl && (
                <div className="overflow-hidden relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold gradient-text">{item.price}</span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gradient-btn px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Buy Now <ExternalLink className="w-4 h-4" />
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchPage;
