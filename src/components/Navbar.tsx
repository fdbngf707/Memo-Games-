import { Link, useLocation } from "react-router-dom";
import { Menu, X, Coins, LogIn, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/authStore";
import logo from "@/assets/memo-games-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/shop", label: "Shop" },
  { to: "/merch", label: "Merch" },
  { to: "/competitions", label: "Competitions" },
  { to: "/news", label: "News" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, userPoints, signOut } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-lg shadow-primary/5"
          : "bg-transparent border-b border-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.img
            src={logo}
            alt="Memo Games"
            width={44}
            height={44}
            className="rounded-full ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 5 }}
          />
          <span className="font-display text-lg font-bold tracking-wider text-foreground group-hover:text-primary transition-colors duration-300">
            MEMO <span className="gradient-text">GAMES</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-300 rounded-full ${
                location.pathname === l.to
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {location.pathname === l.to && (
                <motion.span
                  className="absolute inset-0 rounded-full border border-primary/50 bg-primary/5"
                  layoutId="nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-bold text-foreground">{userPoints}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <button onClick={signOut} className="text-muted-foreground hover:text-destructive transition-colors p-1.5">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full gradient-btn text-sm font-medium"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border px-4 pb-4 space-y-1"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm transition-all ${
                    location.pathname === l.to
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            {/* Mobile auth */}
            <div className="pt-2 border-t border-border">
              {user ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold">{userPoints} pts</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                  </div>
                  <button onClick={() => { signOut(); setOpen(false); }} className="text-destructive text-sm">Logout</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-2.5 gradient-btn rounded-lg text-sm text-center font-medium">
                  Login / Sign Up
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
