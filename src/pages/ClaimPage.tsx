import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, AlertTriangle, CheckCircle2, Loader2, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ClaimState = "loading" | "invalid" | "ready" | "claiming" | "success";

interface TokenData {
  id: string;
  points: number;
  is_used: boolean;
  expires_at: string;
}

const ClaimPage = () => {
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get("token");

  const [state, setState] = useState<ClaimState>("loading");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [claimedPoints, setClaimedPoints] = useState(0);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!tokenId) {
        setErrorMsg("No reward token provided.");
        setState("invalid");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("reward_tokens")
          .select("id, points, is_used, expires_at")
          .eq("id", tokenId)
          .single();

        if (error || !data) {
          setErrorMsg("This reward link is invalid or does not exist.");
          setState("invalid");
          return;
        }

        if (data.is_used) {
          setErrorMsg("This reward has already been claimed.");
          setState("invalid");
          return;
        }

        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (now > expiresAt) {
          setErrorMsg("This reward link has expired.");
          setState("invalid");
          return;
        }

        setTokenData(data as TokenData);
        setState("ready");
      } catch {
        setErrorMsg("Something went wrong. Please try again.");
        setState("invalid");
      }
    };

    validateToken();
  }, [tokenId]);

  // Handle claim submission
  const handleClaim = async () => {
    if (!email || !tokenData) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setState("claiming");
    setErrorMsg("");

    try {
      // Step 1: Mark token as used immediately (burn)
      const { error: burnError } = await supabase
        .from("reward_tokens")
        .update({ is_used: true, claimed_by: email })
        .eq("id", tokenData.id)
        .eq("is_used", false); // Double-check it hasn't been claimed

      if (burnError) {
        setErrorMsg("Failed to claim reward. Please try again.");
        setState("ready");
        return;
      }

      // Step 2: Add points to user_points
      const { data: existing } = await supabase
        .from("user_points")
        .select("points")
        .eq("email", email)
        .single();

      if (existing) {
        await supabase
          .from("user_points")
          .update({ points: existing.points + tokenData.points })
          .eq("email", email);
      } else {
        await supabase
          .from("user_points")
          .insert({ email, points: tokenData.points });
      }

      // Step 3: Log the claim for admin audit
      await supabase.from("reward_claims").insert({
        token_id: tokenData.id,
        email,
        points: tokenData.points,
      });

      setClaimedPoints(tokenData.points);
      setState("success");
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setState("ready");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#39FF14]/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#39FF14]/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#39FF14]/3 blur-[150px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57, 255, 20, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <AnimatePresence mode="wait">
        {/* ─── LOADING ─── */}
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Loader2 className="w-12 h-12 text-[#39FF14] animate-spin mx-auto mb-4" />
            <p className="text-[#39FF14]/70 font-mono text-sm tracking-widest uppercase">
              Validating Voucher...
            </p>
          </motion.div>
        )}

        {/* ─── INVALID / ERROR ─── */}
        {state === "invalid" && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="relative rounded-2xl border border-red-500/30 bg-card/80 backdrop-blur-xl p-8 text-center overflow-hidden">
              {/* Top scanline */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6"
              >
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </motion.div>

              <h1 className="text-2xl font-bold text-foreground mb-3 font-display">
                Link Invalid
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {errorMsg || "This link has already been claimed or is invalid."}
              </p>

              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-muted text-foreground text-sm font-medium transition-colors"
              >
                Return Home
              </a>
            </div>
          </motion.div>
        )}

        {/* ─── READY (Claim Form) ─── */}
        {state === "ready" && tokenData && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="relative rounded-2xl border border-[#39FF14]/20 bg-card/80 backdrop-blur-xl p-8 overflow-hidden">
              {/* Neon top border glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/60 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#39FF14]/20 to-transparent blur-sm" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/30 to-transparent" />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#39FF14]/40 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#39FF14]/40 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#39FF14]/40 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#39FF14]/40 rounded-br-2xl" />

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(57,255,20,0.1), 0 0 40px rgba(57,255,20,0.05)",
                      "0 0 30px rgba(57,255,20,0.2), 0 0 60px rgba(57,255,20,0.1)",
                      "0 0 20px rgba(57,255,20,0.1), 0 0 40px rgba(57,255,20,0.05)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-5"
                >
                  <Gift className="w-10 h-10 text-[#39FF14]" />
                </motion.div>

                <h1 className="text-2xl font-bold text-foreground mb-2 font-display">
                  Claim Your Points
                </h1>
                <p className="text-muted-foreground text-sm">
                  You've received a reward voucher from Memo Games
                </p>
              </div>

              {/* Points display */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center mb-8 py-5 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/15"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-[#39FF14]" />
                  <span className="text-xs font-mono text-[#39FF14]/70 uppercase tracking-widest">
                    Reward Value
                  </span>
                </div>
                <p
                  className="text-5xl font-bold font-display text-[#39FF14]"
                  style={{
                    textShadow:
                      "0 0 10px rgba(57,255,20,0.4), 0 0 30px rgba(57,255,20,0.2), 0 0 60px rgba(57,255,20,0.1)",
                  }}
                >
                  {tokenData.points}
                </p>
                <span className="text-xs text-[#39FF14]/50 font-mono uppercase tracking-wider">
                  Points
                </span>
              </motion.div>

              {/* Email input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Account Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleClaim(); }}
                  className="w-full px-4 py-3.5 rounded-xl bg-secondary/80 border border-[#39FF14]/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14]/40 transition-all text-sm"
                />
                {errorMsg && (
                  <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
                )}
                <p className="text-muted-foreground text-xs mt-2">
                  Points will be added to this account. Use the same email you registered with.
                </p>
              </div>

              {/* Claim button */}
              <button
                onClick={handleClaim}
                disabled={!email}
                className="w-full relative py-3.5 rounded-xl font-semibold text-sm text-black bg-[#39FF14] hover:bg-[#39FF14]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden group"
                style={{
                  boxShadow: email
                    ? "0 0 20px rgba(57,255,20,0.3), 0 0 40px rgba(57,255,20,0.1)"
                    : "none",
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Claim {tokenData.points} Points
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#39FF14] via-[#50FF30] to-[#39FF14] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── CLAIMING (Loading) ─── */}
        {state === "claiming" && (
          <motion.div
            key="claiming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin" />
            </div>
            <p className="text-[#39FF14]/70 font-mono text-sm tracking-widest uppercase mb-2">
              Processing Claim...
            </p>
            <p className="text-muted-foreground text-xs">
              Burning voucher & crediting your account
            </p>
          </motion.div>
        )}

        {/* ─── SUCCESS ─── */}
        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="relative rounded-2xl border border-[#39FF14]/30 bg-card/80 backdrop-blur-xl p-8 text-center overflow-hidden">
              {/* Animated border glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/80 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#39FF14]/20 to-transparent blur-md" />

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/40 flex items-center justify-center mx-auto mb-6"
                style={{
                  boxShadow: "0 0 30px rgba(57,255,20,0.2), 0 0 60px rgba(57,255,20,0.1)",
                }}
              >
                <CheckCircle2 className="w-10 h-10 text-[#39FF14]" />
              </motion.div>

              <h1 className="text-2xl font-bold text-foreground mb-2 font-display">
                Points Claimed!
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Your reward has been successfully added to your account
              </p>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="py-5 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/20 mb-6"
              >
                <p
                  className="text-5xl font-bold font-display text-[#39FF14]"
                  style={{
                    textShadow:
                      "0 0 10px rgba(57,255,20,0.5), 0 0 30px rgba(57,255,20,0.3)",
                  }}
                >
                  +{claimedPoints}
                </p>
                <span className="text-xs text-[#39FF14]/60 font-mono uppercase tracking-wider">
                  Points Added
                </span>
              </motion.div>

              <div className="flex gap-3">
                <a
                  href="/shop"
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-black bg-[#39FF14] hover:bg-[#39FF14]/90 transition-all text-center"
                  style={{
                    boxShadow: "0 0 15px rgba(57,255,20,0.2)",
                  }}
                >
                  Visit Shop
                </a>
                <a
                  href="/"
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-foreground bg-secondary hover:bg-muted border border-border transition-all text-center"
                >
                  Go Home
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClaimPage;
