import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Ghost } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Ghost className="w-20 h-20 text-primary mx-auto mb-6" />
      </motion.div>
      <h1 className="font-display text-6xl md:text-8xl font-black gradient-text mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">This page has vanished into the void.</p>
      <Link
        to="/"
        className="gradient-btn px-8 py-3.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 hover:shadow-xl hover:shadow-primary/25 transition-all"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Home className="w-4 h-4" /> Return Home
        </span>
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
