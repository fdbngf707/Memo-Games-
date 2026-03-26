import { useState } from "react";
import { Mail, Send, CheckCircle, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" } }),
};

const ContactPage = () => {
  const { createThread } = useAppStore();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;
    
    setIsSubmitting(true);
    
    try {
      // Send email via FormSubmit API
      await fetch("https://formsubmit.co/ajax/memo.games.2024@gmail.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
            _subject: `New Contact from ${form.name}: ${form.subject}`
        })
      });

      // Also save to Supabase thread for Admin Dashboard visibility
      await createThread(form.name, form.email, form.subject, form.message);
      
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      // Even if email fails (e.g. adblocker), try to save to DB anyway
      await createThread(form.name, form.email, form.subject, form.message);
      setSent(true); 
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold glow-text text-foreground mb-3">Contact Us</h1>
        <p className="text-muted-foreground text-lg">We'd love to hear from you</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <motion.div
          className="glass-card p-6 md:p-8 neon-border"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Send us a message</h2>
          {sent ? (
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle className="w-14 h-14 text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">Message Sent!</h3>
              <p className="text-sm text-muted-foreground">We'll get back to you as soon as possible.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <textarea
                placeholder="Your message..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
              <button type="submit" disabled={isSubmitting} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                <span className="relative z-10 flex items-center gap-2">
                  <Send className="w-4 h-4" /> {isSubmitting ? "Sending..." : "Send Message"}
                </span>
              </button>
            </form>
          )}
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="glass-card p-6 text-center neon-border group hover:border-primary/40">
            <Mail className="w-10 h-10 text-accent mx-auto mb-3 group-hover:text-primary transition-colors" />
            <p className="text-muted-foreground text-sm mb-1">Email us directly</p>
            <a href="mailto:memo.games.2024@gmail.com" className="text-foreground font-semibold hover:text-primary transition-colors">
              memo.games.2024@gmail.com
            </a>
          </div>
          <div className="glass-card p-6 text-center neon-border group hover:border-primary/40">
            <Clock className="w-10 h-10 text-accent mx-auto mb-3 group-hover:text-primary transition-colors" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">Response Time</h3>
            <p className="text-sm text-muted-foreground">We typically respond within 24-48 hours. For urgent matters, email us directly.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
