import { Link } from "react-router-dom";
import { Youtube, Heart } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/memo-games-logo.png";

const Footer = () => (
  <footer className="bg-card/80 backdrop-blur-md border-t border-border mt-auto relative z-10">
    <div className="container mx-auto px-4 py-10 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <motion.div
            className="flex items-center gap-3 mb-4"
            whileHover={{ scale: 1.02 }}
          >
            <img src={logo} alt="Memo Games" width={40} height={40} className="rounded-full ring-2 ring-primary/20" />
            <span className="font-display text-sm font-bold tracking-wider text-foreground">MEMO <span className="gradient-text">GAMES</span></span>
          </motion.div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Crafting unforgettable gaming experiences. Forging memories that last forever.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="https://m.youtube.com/@memogames-hir" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all duration-300">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Navigation</h4>
          <div className="space-y-2">
            <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Home</Link>
            <Link to="/games" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Games</Link>
            <Link to="/merch" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Merch</Link>
            <Link to="/competitions" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Competitions</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">More</h4>
          <div className="space-y-2">
            <Link to="/news" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">News</Link>
            <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">About Us</Link>
            <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Contact</Link>
            <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">FAQ</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Legal</h4>
          <div className="space-y-2">
            <Link to="/privacy-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms-of-service" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Terms of Service</Link>
            <Link to="/cookie-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Cookie Policy</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5">
        © {new Date().getFullYear()} Memo Games. Made with <Heart className="w-3.5 h-3.5 text-destructive inline animate-pulse" /> All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
