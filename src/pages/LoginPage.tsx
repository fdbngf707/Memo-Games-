import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, ShieldCheck, ArrowLeft, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/authStore";
import { toast } from "sonner";
import logo from "@/assets/memo-games-logo.png";

type Mode = "login" | "signup" | "verify" | "reset" | "reset-code" | "reset-newpw";

const OTP_LENGTH = 8;

const OtpInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(OTP_LENGTH, " ").split("");

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join("").trim();
    onChange(newValue);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pastedData);
    const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-1.5 sm:gap-2">
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-9 h-12 sm:w-11 sm:h-14 text-center text-xl font-bold rounded-xl bg-secondary border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
      ))}
    </div>
  );
};

const LoginPage = () => {
  const { signIn, signUp, verifyOtp, resetPassword, verifyResetOtp, updatePassword } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  const handleSignUp = async () => {
    if (!email || !password) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const success = await signUp(email, password);
    setLoading(false);
    if (success) {
      setMode("verify");
      setOtpCode("");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const success = await signIn(email, password);
    setLoading(false);
    if (success) navigate("/");
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== OTP_LENGTH) {
      toast.error(`Please enter the full ${OTP_LENGTH}-digit code.`);
      return;
    }
    setLoading(true);
    const success = await verifyOtp(email, otpCode);
    setLoading(false);
    if (success) navigate("/");
  };

  const handleResetRequest = async () => {
    if (!email) return;
    setLoading(true);
    const success = await resetPassword(email);
    setLoading(false);
    if (success) {
      setMode("reset-code");
      setOtpCode("");
    }
  };

  const handleResetVerify = async () => {
    if (otpCode.length !== OTP_LENGTH) {
      toast.error(`Please enter the full ${OTP_LENGTH}-digit code.`);
      return;
    }
    setLoading(true);
    const success = await verifyResetOtp(email, otpCode);
    setLoading(false);
    if (success) {
      setMode("reset-newpw");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleSetNewPassword = async () => {
    if (!password || !confirmPassword) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    const success = await updatePassword(password);
    setLoading(false);
    if (success) {
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const titles: Record<Mode, string> = {
    login: "Welcome Back",
    signup: "Create Account",
    verify: "Verify Your Email",
    reset: "Reset Password",
    "reset-code": "Enter Reset Code",
    "reset-newpw": "Set New Password",
  };

  const subtitles: Record<Mode, string> = {
    login: "Sign in to your Memo Games account",
    signup: "Join the community and start earning points!",
    verify: `We sent an ${OTP_LENGTH}-digit code to ${email}`,
    reset: "Enter your email to receive a reset code",
    "reset-code": `Enter the code sent to ${email}`,
    "reset-newpw": "Choose your new password",
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
        
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-1">{titles[mode]}</h1>
            <p className="text-muted-foreground text-sm mb-6">{subtitles[mode]}</p>

            <div className="space-y-4">
              {/* LOGIN */}
              {mode === "login" && (
                <>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className={inputClass} />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <button onClick={() => setMode("reset")} className="text-xs text-muted-foreground hover:text-primary transition-colors">Forgot password?</button>
                  </div>
                  <button onClick={handleLogin} disabled={loading || !email || !password} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : <><LogIn className="w-4 h-4" /> Sign In</>}
                  </button>
                </>
              )}

              {/* SIGN UP */}
              {mode === "signup" && (
                <>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSignUp()} className={inputClass} />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button onClick={handleSignUp} disabled={loading || !email || !password} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : <><UserPlus className="w-4 h-4" /> Sign Up</>}
                  </button>
                </>
              )}

              {/* VERIFY OTP (after signup) */}
              {mode === "verify" && (
                <>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-2">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-foreground">Check your email for an <strong>{OTP_LENGTH}-digit verification code</strong> from Memo Games.</p>
                  </div>
                  <OtpInput value={otpCode} onChange={setOtpCode} />
                  <button onClick={handleVerifyOtp} disabled={loading || otpCode.length !== OTP_LENGTH} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : <><ShieldCheck className="w-4 h-4" /> Verify & Enter</>}
                  </button>
                  <button onClick={() => { signUp(email, password); toast.info("A new code has been sent!"); }} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Didn't receive code? Resend
                  </button>
                </>
              )}

              {/* RESET REQUEST */}
              {mode === "reset" && (
                <>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <button onClick={handleResetRequest} disabled={loading || !email} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : "Send Reset Code"}
                  </button>
                </>
              )}

              {/* RESET CODE */}
              {mode === "reset-code" && (
                <>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-2">
                    <KeyRound className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-foreground">Enter the <strong>{OTP_LENGTH}-digit reset code</strong> sent to your email.</p>
                  </div>
                  <OtpInput value={otpCode} onChange={setOtpCode} />
                  <button onClick={handleResetVerify} disabled={loading || otpCode.length !== OTP_LENGTH} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : <><ShieldCheck className="w-4 h-4" /> Verify Code</>}
                  </button>
                </>
              )}

              {/* NEW PASSWORD */}
              {mode === "reset-newpw" && (
                <>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="New Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <input type={showPw ? "text" : "password"} placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSetNewPassword()} className={inputClass} />
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive text-left">Passwords do not match</p>
                  )}
                  <button onClick={handleSetNewPassword} disabled={loading || !password || !confirmPassword || password !== confirmPassword} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : "Set New Password"}
                  </button>
                </>
              )}
            </div>

            {/* Footer Links */}
            <div className="mt-6">
              {mode === "login" && (
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Sign Up</button>
                </p>
              )}
              {mode === "signup" && (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Sign In</button>
                </p>
              )}
              {(mode === "reset" || mode === "reset-code" || mode === "reset-newpw" || mode === "verify") && (
                <button onClick={() => setMode("login")} className="text-sm text-primary hover:underline font-medium flex items-center justify-center gap-1 mx-auto">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;
