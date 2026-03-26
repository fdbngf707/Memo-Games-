import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Coins, Download, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/authStore";

const ShopPage = () => {
  const { user, userPoints, shopItems, purchases, purchaseItem, fetchShopItems } = useAuthStore();

  useEffect(() => {
    fetchShopItems();
  }, []);

  const hasPurchased = (itemId: string) => purchases.some((p) => p.item_id === itemId);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold mb-3">
          <span className="gradient-text">Rewards Shop</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Spend your points on exclusive games, content, and rewards!
        </p>

        {user ? (
          <motion.div
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 rounded-full bg-primary/10 border border-primary/30"
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          >
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-foreground text-lg">{userPoints}</span>
            <span className="text-muted-foreground text-sm">points</span>
          </motion.div>
        ) : (
          <div className="mt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 gradient-btn px-6 py-2 rounded-full text-sm font-medium"
            >
              <Lock className="w-4 h-4" /> Login to purchase
            </Link>
          </div>
        )}
      </motion.div>

      {shopItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No items in the shop yet. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item, i) => {
            const owned = hasPurchased(item.id);
            const canAfford = userPoints >= item.points_cost;

            return (
              <motion.div
                key={item.id}
                className="glass-card overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {item.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-foreground">{item.points_cost}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>

                    {owned ? (
                      <a
                        href={item.download_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium hover:bg-green-500/20 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    ) : user ? (
                      <button
                        onClick={() => purchaseItem(item.id)}
                        disabled={!canAfford}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          canAfford
                            ? "gradient-btn hover:shadow-lg hover:shadow-primary/20"
                            : "bg-secondary text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {canAfford ? "Buy" : "Not enough points"}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
                      >
                        <Lock className="w-4 h-4" /> Login
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
