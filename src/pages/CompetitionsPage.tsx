import { useState } from "react";
import { Trophy, Calendar, Users, Clock, ChevronRight, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore, Competition } from "@/lib/store";

const statusColors = {
  open: "bg-green-500/20 text-green-400 border-green-500/30",
  ongoing: "bg-accent/20 text-accent border-accent/30",
  ended: "bg-muted text-muted-foreground border-border",
};

const statusLabels = { open: "Open", ongoing: "In Progress", ended: "Ended" };

const cardAnim = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const CompetitionsPage = () => {
  const { competitions } = useAppStore();
  const [filter, setFilter] = useState<"all" | "open" | "ongoing" | "ended">("all");
  const filtered = filter === "all" ? competitions : competitions.filter((c) => c.status === filter);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-bold glow-text text-foreground mb-3">Competitions</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Compete, dominate, and earn glory. Join our tournaments and prove your skills.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex gap-2 flex-wrap justify-center mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {(["all", "open", "ongoing", "ended"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f ? "gradient-btn shadow-lg shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {f === "all" ? "All" : statusLabels[f]} ({f === "all" ? competitions.length : competitions.filter((c) => c.status === f).length})
          </button>
        ))}
      </motion.div>

      {/* Competition Cards */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No competitions yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filtered.map((comp, i) => (
            <motion.div
              key={comp.id}
              className="glass-card p-6 hover:border-primary/30 neon-border group"
              variants={cardAnim}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {comp.image_url && (
                <div className="h-40 rounded-lg overflow-hidden mb-4">
                  <img src={comp.image_url} alt={comp.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {comp.title}
                  </h3>
                  <span className="text-xs text-primary">{comp.game}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[comp.status]}`}>
                  {statusLabels[comp.status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{comp.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{comp.start_date ? new Date(comp.start_date).toLocaleDateString() : "TBD"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{comp.end_date ? new Date(comp.end_date).toLocaleDateString() : "TBD"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Max {comp.max_participants}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="truncate">{comp.prize || "TBA"}</span>
                </div>
              </div>
              {comp.first_place_points > 0 && (
                <div className="mb-4 bg-secondary/50 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Coins className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs font-medium text-foreground">Prize Points</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {[{p:"🥇 1st",m:1},{p:"🥈 2nd",m:0.7},{p:"🥉 3rd",m:0.5},{p:"4th",m:0.3},{p:"5th",m:0.15}].map(r => (
                      <span key={r.p} className="text-xs">
                        <span className="text-muted-foreground">{r.p}:</span>{" "}
                        <span className="text-primary font-semibold">{Math.round(comp.first_place_points * r.m)} pts</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {comp.status !== "ended" && (
                <button className="gradient-btn px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 w-full justify-center hover:shadow-lg hover:shadow-primary/20 transition-all">
                  <span className="relative z-10 flex items-center gap-2">
                    {comp.status === "open" ? "Join Competition" : "View Details"} <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitionsPage;
