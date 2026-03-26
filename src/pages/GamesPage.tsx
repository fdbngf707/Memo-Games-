import { useState } from "react";
import { Search, SlidersHorizontal, Download, Play, ChevronRight, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

const genres = ["All", "RPG", "Racing", "Strategy", "Horror", "Action", "Adventure", "Puzzle", "Sports"];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 40, scale: 0.92, rotateX: 8 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3 } },
};

const GamesPage = () => {
  const { games } = useAppStore();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");

  const filtered = games.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === "All" || g.genre === genre;
    return matchSearch && matchGenre;
  });

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      {/* Header with icon animation */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="flex items-center gap-3 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Gamepad2 className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl font-bold glow-text">
            Our <span className="gradient-text">Games</span>
          </h1>
        </motion.div>
        <motion.p
          className="text-muted-foreground text-lg"
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Discover our complete collection of titles
        </motion.p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <motion.div
          className="relative flex-1 max-w-md"
          whileFocusWithin={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </motion.div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-5 h-5 text-muted-foreground hidden md:block" />
          {genres.map((g, i) => (
            <motion.button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                genre === g ? "gradient-btn shadow-lg shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {g}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <motion.p
        className="text-xs text-muted-foreground mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        key={`${search}-${genre}`}
      >
        {filtered.length} game{filtered.length !== 1 ? "s" : ""} found
      </motion.p>

      {/* Game Cards */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            </motion.div>
            <p className="text-muted-foreground text-lg">No games found matching your criteria.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${search}-${genre}`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((game) => (
              <motion.div
                key={game.id}
                className="glass-card overflow-hidden group hover:border-primary/30 neon-border"
                variants={cardAnim}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 },
                }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                {game.imageUrl && (
                  <div className="relative overflow-hidden">
                    <Link to={`/games/${game.id}`} className="block w-full h-full">
                      <motion.img
                        src={game.imageUrl}
                        alt={game.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.12 }}
                        transition={{ duration: 0.7 }}
                      />
                    </Link>
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 pointer-events-none" />
                    
                    {/* Hover shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -skew-x-12"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "200%" }}
                      transition={{ duration: 0.8 }}
                    />

                    {game.trailerUrl && (
                      <motion.a
                        href={game.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 bg-primary/90 text-primary-foreground p-2.5 rounded-full hover:bg-primary transition-all duration-300"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play className="w-4 h-4" />
                      </motion.a>
                    )}

                    {/* Screenshot count badge */}
                    {game.screenshots && game.screenshots.length > 0 && (
                      <motion.span
                        className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        📸 {game.screenshots.length + 1}
                      </motion.span>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <motion.span
                    className="text-xs font-medium text-primary inline-block"
                    whileHover={{ x: 3, scale: 1.05 }}
                  >
                    {game.genre}
                  </motion.span>
                  <Link to={`/games/${game.id}`} className="block mt-1">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">{game.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{game.description}</p>

                  {/* Platform badges */}
                  {game.platform_links && game.platform_links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {game.platform_links.map((pl, idx) => (
                        <motion.span
                          key={idx}
                          className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground border border-border/50"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * idx }}
                        >
                          {pl.platform}
                        </motion.span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to={`/games/${game.id}`}
                        className="gradient-btn px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 hover:shadow-lg hover:shadow-primary/20 transition-all justify-center w-full"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                    {game.downloadLink && (
                      <motion.a
                        href={game.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-border bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-all flex-1 justify-center"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Download className="w-4 h-4" /> Download
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamesPage;
