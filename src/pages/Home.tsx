import { Link } from "react-router-dom";
import { ChevronRight, Gamepad2, Sparkles, Trophy, Users } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring, useInView } from "framer-motion";
import { useAppStore } from "@/lib/store";
import logo from "@/assets/memo-games-logo.png";
import { useRef, useEffect, useState } from "react";

// ─── Animation Variants ───
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const letterReveal = {
  hidden: { opacity: 0, y: 50, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.03, duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

// ─── Animated Counter Component ───
const AnimatedCounter = ({ value }: { value: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric part
    const numericMatch = value.match(/^(\d+)/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNum = parseInt(numericMatch[1]);
    const suffix = value.replace(numericMatch[1], "");
    const duration = 2000;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetNum * eased);
      setDisplayValue(current + suffix);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return <div ref={ref}>{displayValue}</div>;
};

// ─── Magnetic hover component ───
const MagneticWrapper = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
};

// ─── Title character-by-character animation ───
const AnimatedTitle = ({ text, className }: { text: string; className?: string }) => (
  <motion.span className={className} style={{ display: "inline-flex", overflow: "hidden" }}>
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        variants={letterReveal}
        custom={i}
        initial="hidden"
        animate="visible"
        style={{ display: "inline-block" }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </motion.span>
);

const Home = () => {
  const { games, siteStats } = useAppStore();

  const statsData = [
    { icon: Gamepad2, label: "Games", value: siteStats.games_count, desc: siteStats.games_label },
    { icon: Users, label: "Players", value: siteStats.players_count, desc: siteStats.players_label },
    { icon: Trophy, label: "Awards", value: siteStats.awards_count, desc: siteStats.awards_label },
    { icon: Sparkles, label: "Founded", value: siteStats.founded_count, desc: siteStats.founded_label },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 sm:py-28 md:py-44 px-4 overflow-hidden hero-grid">
        {/* Floating Orbs with enhanced animation */}
        <motion.div
          className="floating-orb w-96 h-96 bg-primary -top-20 -left-20"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="floating-orb w-80 h-80 bg-accent -bottom-20 -right-20"
          animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="floating-orb w-64 h-64 bg-[hsl(var(--neon))] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo with 3D rotation */}
        <MagneticWrapper>
          <motion.img
            src={logo}
            alt="Memo Games"
            width={120}
            height={120}
            className="relative z-10 rounded-2xl mb-6 sm:mb-8 w-24 h-24 sm:w-[120px] sm:h-[120px] ring-4 ring-primary/20"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
              transition: { rotate: { duration: 0.5 } },
            }}
            whileTap={{ scale: 0.9 }}
          />
        </MagneticWrapper>

        {/* Title with character-by-character reveal */}
        <div className="relative z-10">
          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-2 glow-text">
            <AnimatedTitle text="CRAFTING WORLDS." />
          </h1>
          <h2 className="font-display text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              FORGING{" "}
            </motion.span>
            <motion.span
              className="gradient-text"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
            >
              MEMORIES.
            </motion.span>
          </h2>
        </div>

        {/* Subtitle with typewriter-like reveal */}
        <motion.p
          className="relative z-10 text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mb-8 sm:mb-10 px-2"
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          Welcome to the official home of Memo Games. Experience our catalog of imaginative titles that push the boundaries of interactive entertainment.
        </motion.p>

        {/* CTA Buttons with stagger */}
        <motion.div
          className="relative z-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-4 sm:px-0"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={slideFromLeft}>
            <MagneticWrapper>
              <Link
                to="/games"
                className="gradient-btn px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 text-sm hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
              >
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  Explore Our Games{" "}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.span>
                </motion.span>
              </Link>
            </MagneticWrapper>
          </motion.div>
          <motion.div variants={slideFromRight}>
            <MagneticWrapper>
              <Link
                to="/competitions"
                className="px-8 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-secondary hover:border-primary/30 transition-all duration-300 text-center block"
              >
                Competitions
              </Link>
            </MagneticWrapper>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Beyond the Screen Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0}
          >
            <motion.h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 glow-text"
              whileInView={{
                textShadow: [
                  "0 0 20px hsl(255 70% 55% / 0.2)",
                  "0 0 60px hsl(255 70% 55% / 0.5)",
                  "0 0 20px hsl(255 70% 55% / 0.2)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              viewport={{ once: true }}
            >
              BEYOND THE <span className="gradient-text">SCREEN</span>
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Founded with a passion for storytelling and innovative gameplay, Memo Games brings together talented developers to create experiences that linger long after the display goes dark.
            </motion.p>
          </motion.div>

          {/* Stats Grid — now using admin-controllable data */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card p-6 text-center group hover:border-primary/40 neon-border relative overflow-hidden"
                variants={scaleIn}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 },
                }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full"
                  whileHover={{ translateX: "200%" }}
                  transition={{ duration: 0.8 }}
                />

                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
                >
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:text-accent transition-colors duration-300" />
                </motion.div>

                <div className="font-display text-3xl font-bold gradient-text mb-1">
                  <AnimatedCounter value={stat.value} />
                </div>

                <motion.div
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  {stat.desc}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Games */}
      {games.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              className="flex items-center justify-between mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <motion.h2
                className="font-display text-3xl sm:text-4xl font-bold"
                whileHover={{ scale: 1.02 }}
              >
                RECOMMENDED <span className="gradient-text">FOR YOU</span>
              </motion.h2>
              <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                <Link to="/games" className="text-primary text-sm font-medium hover:text-accent transition-colors flex items-center gap-1">
                  View All{" "}
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                    <ChevronRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {games.slice(0, 3).map((game, i) => (
                <motion.div
                  key={game.id}
                  className="glass-card overflow-hidden group hover:border-primary/30 neon-border"
                  variants={{
                    hidden: { opacity: 0, y: 60, rotateY: -15 },
                    visible: {
                      opacity: 1, y: 0, rotateY: 0,
                      transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" },
                    },
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    transition: { duration: 0.3, type: "spring", stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {game.imageUrl && (
                    <motion.div className="relative overflow-hidden">
                      <Link to={`/games/${game.id}`} className="block w-full h-full">
                        <motion.img
                          src={game.imageUrl}
                          alt={game.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                          whileHover={{ scale: 1.15 }}
                          transition={{ duration: 0.7 }}
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />

                      {/* Hover overlay with glow */}
                      <motion.div
                        className="absolute inset-0 bg-primary/10 pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  )}
                  <div className="p-5">
                    <motion.span
                      className="text-xs font-medium text-primary inline-block"
                      whileHover={{ scale: 1.1, x: 3 }}
                    >
                      {game.genre}
                    </motion.span>
                    <Link to={`/games/${game.id}`} className="block mt-1">
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">{game.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{game.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          className="container mx-auto text-center glass-card p-12 md:p-16 neon-border relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="floating-orb w-48 h-48 bg-primary top-0 right-0"
            animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="floating-orb w-48 h-48 bg-accent bottom-0 left-0"
            animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
          />

          <motion.h2
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4 relative z-10 glow-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Crafting experiences that{" "}
            <motion.span
              className="gradient-text"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              transcend reality
            </motion.span>
            .
          </motion.h2>

          <motion.p
            className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto relative z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join our community and stay updated with the latest releases, competitions, and behind-the-scenes content.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <MagneticWrapper>
              <Link
                to="/contact"
                className="gradient-btn px-8 py-3.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 relative z-10"
              >
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  Get in Touch{" "}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.span>
                </motion.span>
              </Link>
            </MagneticWrapper>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
