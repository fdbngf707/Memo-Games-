import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, Clock, Link as LinkIcon, Send, ArrowLeft, Loader2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { toast } from "sonner";

interface Participant {
  id: string;
  user_email: string;
  submission_url: string;
  placement: number;
  status: "joined" | "submitted" | "won";
}

const CompetitionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { competitions } = useAppStore();
  
  const competition = competitions.find(c => c.id === id);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");

  const myParticipation = participants.find(p => p.user_email === user?.email);
  const isJoined = !!myParticipation;
  const isSubmitted = myParticipation?.status === "submitted" || myParticipation?.status === "won";

  useEffect(() => {
    if (id) fetchParticipants();
  }, [id]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("competition_participants")
        .select("*")
        .eq("competition_id", id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setParticipants(data as Participant[]);
        const me = data.find(p => p.user_email === user?.email);
        if (me?.submission_url) setSubmissionUrl(me.submission_url);
      }
    } catch {
      // Table may not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please login to join the competition!");
      navigate("/login");
      return;
    }

    if (participants.length >= (competition?.max_participants || 100)) {
      toast.error("This competition is full!");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("competition_participants").insert({
        competition_id: id,
        user_email: user.email,
        status: "joined"
      });

      if (error) throw error;
      
      toast.success("Successfully joined the competition!");
      addNotification(user.email, "Competition Joined 🎮", `You successfully registered for "${competition?.title}". Good luck!`);
      fetchParticipants();
    } catch (err: any) {
      toast.error("Failed to join: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("competition_participants")
        .update({ 
          submission_url: submissionUrl,
          status: "submitted"
        })
        .eq("competition_id", id)
        .eq("user_email", user.email);

      if (error) throw error;

      toast.success("Project submitted successfully!");
      addNotification(user.email, "Project Submitted 🚀", `Your project entry for "${competition?.title}" has been saved. We will notify you when the results are in!`);
      fetchParticipants();
    } catch (err: any) {
      toast.error("Failed to submit project: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!competition) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
      <button 
        onClick={() => navigate("/competitions")}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Competitions
      </button>

      {/* Hero Header */}
      <motion.div 
        className="glass-card rounded-2xl overflow-hidden border border-primary/20 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {competition.image_url && (
          <div className="h-64 sm:h-80 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-transparent to-transparent z-10" />
            <img 
              src={competition.image_url} 
              alt={competition.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 sm:p-8 relative z-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
                {competition.game}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {competition.title}
              </h1>
            </div>
            <div className="px-4 py-2 rounded-xl bg-secondary/80 border border-border/50 text-center shrink-0">
              <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</span>
              <span className="font-bold text-lg capitalize text-foreground">{competition.status}</span>
            </div>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mb-8">
            {competition.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 flex flex-col gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Starts</span>
              <span className="font-medium">{new Date(competition.start_date).toLocaleDateString()}</span>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 flex flex-col gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Ends</span>
              <span className="font-medium">{new Date(competition.end_date).toLocaleDateString()}</span>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 flex flex-col gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Participants</span>
              <span className="font-medium">{participants.length} / {competition.max_participants}</span>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 flex flex-col gap-2 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10">
                 <Trophy className="w-20 h-20 text-yellow-500" />
               </div>
              <Trophy className="w-5 h-5 text-yellow-500 relative z-10" />
              <span className="text-xs text-muted-foreground relative z-10">Prize</span>
              <span className="font-medium truncate relative z-10">{competition.prize}</span>
            </div>
          </div>
          
          {competition.first_place_points > 0 && (
            <div className="flex flex-wrap items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20 mb-8">
              <Coins className="w-6 h-6 text-yellow-500" />
              <div className="font-semibold">Prize Pool ({competition.first_place_points} pts total)</div>
              <div className="flex gap-4 ml-auto text-sm">
                 <span className="text-yellow-400">1st: {Math.round(competition.first_place_points)}</span>
                 <span className="text-gray-400">2nd: {Math.round(competition.first_place_points * 0.7)}</span>
                 <span className="text-amber-600">3rd: {Math.round(competition.first_place_points * 0.5)}</span>
              </div>
            </div>
          )}

          {/* Action Area */}
          <div className="bg-card/50 p-6 rounded-xl border border-border">
            {competition.status !== "open" && !isJoined ? (
              <div className="text-center text-muted-foreground">
                Registration is closed for this competition.
              </div>
            ) : !isJoined ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">Ready to compete?</h3>
                  <p className="text-muted-foreground text-sm">Join now to secure your spot.</p>
                </div>
                <button 
                  onClick={handleJoin}
                  disabled={submitting}
                  className="gradient-btn px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                  Join Competition
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">You are registered!</h3>
                    <p className="text-muted-foreground text-sm">
                      {isSubmitted ? "Your project has been submitted." : "Submit your project link below."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitProject} className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      required
                      placeholder="https://yourname.itch.io/project"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={submitting || !submissionUrl.trim()}
                    className="gradient-btn px-6 py-3 rounded-xl font-bold flex items-center gap-2 justify-center disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isSubmitted ? "Update Link" : "Submit Entry"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Participants List */}
      <motion.div 
        className="glass-card p-6 rounded-2xl border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Participants
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : participants.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No participants yet. Be the first to join!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((p, i) => (
              <div key={p.id} className="bg-secondary/30 p-4 rounded-xl border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center font-bold text-muted-foreground shadow-inner">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {/* Hide full email roughly */}
                    {p.user_email.split('@')[0].slice(0, 3)}***@{p.user_email.split('@')[1]}
                  </div>
                  {p.placement > 0 ? (
                    <span className="text-xs font-bold text-yellow-500 flex items-center gap-1 mt-1">
                      <Trophy className="w-3 h-3" /> {p.placement}{p.placement === 1 ? 'st' : p.placement === 2 ? 'nd' : p.placement === 3 ? 'rd' : 'th'} Place
                    </span>
                  ) : p.submission_url ? (
                    <a 
                      href={p.submission_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <LinkIcon className="w-3 h-3" /> View Submission
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground mt-1 block">Registered</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
  
// Need a quick local import for Check so I don't break the build!
import { Check } from "lucide-react";

export default CompetitionDetailsPage;
