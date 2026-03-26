import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Download, Play, Calendar, Tag, Monitor, Laptop, Terminal, Gamepad2, Smartphone, Globe, X, ChevronRight, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

const GameDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games } = useAppStore();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const game = games.find((g) => g.id === id);

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.h2
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >Game Not Found</motion.h2>
        <motion.p
          className="text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >The game you are looking for does not exist or has been removed.</motion.p>
        <motion.button
          onClick={() => navigate("/games")}
          className="gradient-btn px-6 py-2 rounded-full font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Games
        </motion.button>
      </div>
    );
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("youtu.be/")) {
        const videoId = new URL(url).pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch {
      // fallback
    }
    return null;
  };

  const embedUrl = getEmbedUrl(game.trailerUrl);

  const allScreenshots = game.screenshots && game.screenshots.length > 0 ? game.screenshots : [];
  // If we have an imageUrl and it's not already in screenshots, prepend it for gallery
  const galleryImages = game.imageUrl && !allScreenshots.includes(game.imageUrl)
    ? [game.imageUrl, ...allScreenshots]
    : allScreenshots.length > 0 ? allScreenshots : (game.imageUrl ? [game.imageUrl] : []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Windows": return <Monitor className="w-5 h-5" />;
      case "Mac": return <Laptop className="w-5 h-5" />;
      case "Linux": return <Terminal className="w-5 h-5" />;
      case "PlayStore":
      case "AppStore": return <Smartphone className="w-5 h-5" />;
      case "Web": return <Globe className="w-5 h-5" />;
      default: return <Gamepad2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      {/* Back Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <motion.button
          onClick={() => navigate("/games")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          whileHover={{ x: -4 }}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Games
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Media */}
        <motion.div
          className="lg:col-span-7 space-y-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Main Media: Trailer or Hero Image */}
          {embedUrl ? (
            <motion.div
              className="w-full aspect-video rounded-2xl overflow-hidden glass-card neon-border border border-primary/20 bg-background/50 relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <iframe
                src={embedUrl}
                title={`${game.title} Trailer`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          ) : game.imageUrl ? (
            <motion.div
              className="w-full aspect-video rounded-2xl overflow-hidden glass-card neon-border border border-primary/20 bg-background/50 relative cursor-pointer group"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => setLightboxIdx(0)}
              whileHover={{ scale: 1.01 }}
            >
              <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-3 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  <ZoomIn className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="w-full aspect-video rounded-2xl overflow-hidden glass-card flex items-center justify-center border border-primary/20 bg-background/50">
              <span className="text-muted-foreground">No media available</span>
            </div>
          )}

          {/* Screenshot Gallery */}
          {galleryImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Screenshots</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {galleryImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    className="aspect-video rounded-lg overflow-hidden glass-card cursor-pointer border border-border/50 hover:border-primary/50 transition-colors group relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.08, duration: 0.4 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLightboxIdx(idx)}
                  >
                    <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Single screenshot case: if there's a trailer and also an image */}
          {embedUrl && game.imageUrl && galleryImages.length <= 1 && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="aspect-video rounded-lg overflow-hidden glass-card cursor-pointer border hover:border-primary/50 transition-colors group relative"
                whileHover={{ y: -4, scale: 1.03 }}
                onClick={() => setLightboxIdx(0)}
              >
                <img src={game.imageUrl} alt={`${game.title} screenshot`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Right Column: Info */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-primary/20 neon-border h-full flex flex-col pt-10">
            {/* Tags */}
            <motion.div
              className="flex flex-wrap gap-2 mb-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary uppercase tracking-wider flex items-center gap-1.5"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Tag className="w-3 h-3" /> {game.genre}
              </motion.span>
              {game.releaseDate && (
                <motion.span
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border border-border"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Calendar className="w-3 h-3" /> {new Date(game.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </motion.span>
              )}
            </motion.div>

            {/* Title with stagger animation */}
            <motion.h1
              className="font-display text-4xl md:text-5xl font-bold mb-6 glow-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            >
              {game.title}
            </motion.h1>
            
            {/* Description with fade */}
            <motion.div
              className="prose prose-invert prose-p:text-muted-foreground max-w-none mb-8 whitespace-pre-line text-lg flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p>{game.description}</p>
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              className="flex flex-col gap-4 mt-auto pt-6 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                {game.platform_links && game.platform_links.length > 0 ? (
                  game.platform_links.map((link, idx) => (
                    <motion.a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gradient-btn px-6 py-4 rounded-xl font-bold text-center flex items-center justify-center gap-3 flex-1 min-w-[200px] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 + idx * 0.1, type: "spring", stiffness: 200 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="relative z-10 flex items-center gap-2 text-base">
                        {getPlatformIcon(link.platform)} Get on {link.platform}
                      </span>
                    </motion.a>
                  ))
                ) : game.downloadLink ? (
                  <motion.a
                    href={game.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gradient-btn px-6 py-4 rounded-xl font-bold text-center flex items-center justify-center gap-3 flex-1 min-w-[200px] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="relative z-10 flex items-center gap-2 text-lg">
                      <Download className="w-5 h-5" /> Download Now
                    </span>
                  </motion.a>
                ) : (
                  <button
                    disabled
                    className="bg-secondary text-muted-foreground px-6 py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 flex-1 min-w-[200px] cursor-not-allowed border border-border"
                  >
                    <Download className="w-5 h-5" /> Coming Soon
                  </button>
                )}
              </div>
              
              {!embedUrl && game.trailerUrl && (
                <motion.a
                  href={game.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 border border-primary/50 text-foreground hover:bg-primary/10 transition-colors w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Play className="w-5 h-5 text-primary" /> Watch Trailer
                </motion.a>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && galleryImages.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
          >
            <motion.button
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLightboxIdx(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {galleryImages.length > 1 && (
              <>
                <motion.button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + galleryImages.length) % galleryImages.length); }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
                  whileHover={{ scale: 1.1, x: 3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % galleryImages.length); }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </>
            )}

            <motion.img
              key={lightboxIdx}
              src={galleryImages[lightboxIdx]}
              alt={`Screenshot ${lightboxIdx + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            />

            {galleryImages.length > 1 && (
              <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === lightboxIdx ? "bg-primary scale-125" : "bg-white/30 hover:bg-white/50"}`}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameDetailsPage;
