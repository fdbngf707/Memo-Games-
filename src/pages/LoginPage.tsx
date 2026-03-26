import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/authStore";
import logo from "@/assets/memo-games-logo.png";

const LoginPage = () => {
  const { signIn, signUp, resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    if (mode !== "reset" && !password) return;

    setLoading(true);
    let success = false;
    
    if (mode === "reset") {
      success = await resetPassword(email);
      if (success) setMode("login");
    } else if (mode === "login") {
      success = await signIn(email, password);
      if (success) navigate("/");
    } else {
      success = await signUp(email, password);
      if (success) setMode("login");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="glass-card p-8 w-full max-w-md text-center neon-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img src={logo} alt="Memo Games" width={60} height={60} className="mx-auto rounded-xl mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          {mode === "login" ? "Sign in to your account" : mode === "signup" ? "Join Memo Games and earn points!" : "Enter your email to receive a reset link"}
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          {mode !== "reset" && (
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button 
                onClick={() => setMode("reset")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || (mode !== "reset" && !password)}
            className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : mode === "reset" ? (
              "Send Reset Link"
            ) : mode === "login" ? (
              <><LogIn className="w-4 h-4" /> Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Sign Up</>
            )}
          </button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          {mode === "reset" ? (
            <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium flex items-center justify-center gap-1 mx-auto">
              Back to Login
            </button>
          ) : mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Sign Up</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Sign In</button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
