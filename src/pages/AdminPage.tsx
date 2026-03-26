import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, LogOut, Plus, Trash2, Gamepad2, Megaphone, HelpCircle, ShoppingBag, MessageSquare, Coins, Store, Trophy, Pencil, X, Gift, BarChart3, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import ScreenshotUploader from "@/components/ScreenshotUploader";
import AdminMessages from "@/components/AdminMessages";
import logo from "@/assets/memo-games-logo.png";

const inputClass = "px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

// Generic edit modal
const EditModal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <AnimatePresence>
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const AdminPage = () => {
  const { isAdmin, login, logout, games, news, faqs, merch, threads, competitions,
    addGame, removeGame, updateGame, addNews, removeNews, updateNews,
    addFaq, removeFaq, updateFaq, addMerch, removeMerch, updateMerch,
    addCompetition, removeCompetition, updateCompetition, siteStats, updateSiteStats } = useAppStore();
  const { addPointsToUser, addShopItem, removeShopItem, shopItems, fetchShopItems, fetchAllUsers } = useAuthStore();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"games" | "news" | "faqs" | "merch" | "messages" | "points" | "shop" | "competitions" | "rewards" | "stats">("games");
  const [rewardClaims, setRewardClaims] = useState<{ id: string; email: string; points: number; claimed_at: string }[]>([]);
  const [statsForm, setStatsForm] = useState(siteStats);

  // Forms
  const [gameForm, setGameForm] = useState({ title: "", description: "", genre: "Action", imageUrl: "", releaseDate: "", downloadLink: "", trailerUrl: "", platform_links: [] as {platform: string, url: string}[], screenshots: [] as string[] });
  const [newsForm, setNewsForm] = useState({ title: "", content: "", category: "Release", date: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [merchForm, setMerchForm] = useState({ title: "", description: "", price: "", imageUrl: "", link: "" });
  const [compForm, setCompForm] = useState({ title: "", description: "", game: "", start_date: "", end_date: "", prize: "", max_participants: "100", first_place_points: "100", status: "open" as const, image_url: "" });
  const [pointsEmail, setPointsEmail] = useState("");
  const [pointsAmount, setPointsAmount] = useState("");
  const [allUsers, setAllUsers] = useState<{ email: string; points: number }[]>([]);
  const [shopForm, setShopForm] = useState({ title: "", description: "", image_url: "", points_cost: "", download_link: "" });

  // Edit state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<string>("");

  const openThreads = threads.filter((t) => t.status === "open").length;

  const fetchRewardClaims = async () => {
    try {
      const { data } = await supabase
        .from("reward_claims")
        .select("id, email, points, claimed_at")
        .order("claimed_at", { ascending: false })
        .limit(50);
      if (data) setRewardClaims(data);
    } catch {
      // Table may not exist yet - silently ignore
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchShopItems();
      fetchAllUsers().then(setAllUsers);
      fetchRewardClaims();
    }
  }, [isAdmin]);

  const startEdit = (type: string, item: any) => { setEditType(type); setEditingItem({ ...item }); };
  const closeEdit = () => { setEditingItem(null); setEditType(""); };

  const saveEdit = async () => {
    if (!editingItem) return;
    const { id, ...rest } = editingItem;
    if (editType === "game") await updateGame(id, rest);
    if (editType === "news") await updateNews(id, rest);
    if (editType === "faq") await updateFaq(id, rest);
    if (editType === "merch") await updateMerch(id, rest);
    if (editType === "competition") await updateCompetition(id, rest);
    closeEdit();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div className="glass-card p-8 w-full max-w-md text-center neon-border" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <img src={logo} alt="Memo Games" width={60} height={60} className="mx-auto rounded-xl mb-4" />
          <Shield className="w-10 h-10 text-accent mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground mb-1">Admin Access</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter the admin password to continue</p>
          {error && <p className="text-destructive text-sm mb-3">{error}</p>}
          <div className="relative mb-4">
            <input type={showPw ? "text" : "password"} placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={async (e) => { if (e.key === "Enter") { if (!(await login(password))) setError("Incorrect password"); } }}
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button onClick={async () => { if (!(await login(password))) setError("Incorrect password"); }} className="w-full gradient-btn py-3 rounded-lg font-semibold text-sm">Login</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage games, news, FAQs, merch, competitions & more</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive text-sm hover:bg-destructive/10"><LogOut className="w-4 h-4" /> Logout</button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { key: "games" as const, icon: Gamepad2, label: `Games (${games.length})` },
          { key: "news" as const, icon: Megaphone, label: `News (${news.length})` },
          { key: "faqs" as const, icon: HelpCircle, label: `FAQs (${faqs.length})` },
          { key: "merch" as const, icon: ShoppingBag, label: `Merch (${merch.length})` },
          { key: "competitions" as const, icon: Trophy, label: `Competitions (${competitions.length})` },
          { key: "messages" as const, icon: MessageSquare, label: `Messages${openThreads > 0 ? ` (${openThreads})` : ""}` },
          { key: "points" as const, icon: Coins, label: "Points" },
          { key: "shop" as const, icon: Store, label: `Shop (${shopItems.length})` },
          { key: "rewards" as const, icon: Gift, label: `Rewards (${rewardClaims.length})` },
          { key: "stats" as const, icon: BarChart3, label: "Stats" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${tab === t.key ? "gradient-btn shadow-lg shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Games Tab */}
        {tab === "games" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Add New Game</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Title" value={gameForm.title} onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })} className={inputClass} />
                <select value={gameForm.genre} onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })} className={inputClass}>
                  {["Action", "RPG", "Racing", "Strategy", "Horror", "Adventure", "Puzzle", "Sports"].map((g) => <option key={g}>{g}</option>)}
                </select>
                <input placeholder="Download Link" value={gameForm.downloadLink} onChange={(e) => setGameForm({ ...gameForm, downloadLink: e.target.value })} className={inputClass} />
                <input placeholder="Trailer URL (YouTube)" value={gameForm.trailerUrl} onChange={(e) => setGameForm({ ...gameForm, trailerUrl: e.target.value })} className={inputClass} />
                <input type="date" value={gameForm.releaseDate} onChange={(e) => setGameForm({ ...gameForm, releaseDate: e.target.value })} className={inputClass} />
                <div />
                <div className="md:col-span-2"><label className="text-sm text-muted-foreground mb-1 block">Game Image</label><ImageUpload value={gameForm.imageUrl} onChange={(url) => setGameForm({ ...gameForm, imageUrl: url })} /></div>
                <textarea placeholder="Description" value={gameForm.description} onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })} className={`md:col-span-2 ${inputClass} h-20 resize-none`} />
                <div className="md:col-span-2 space-y-2 mt-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
                  <label className="text-sm font-semibold text-foreground mb-2 block">Platform Download Links</label>
                  {gameForm.platform_links.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={link.platform} onChange={e => {
                          const newLinks = [...gameForm.platform_links];
                          newLinks[idx].platform = e.target.value;
                          setGameForm({...gameForm, platform_links: newLinks});
                        }}
                        className={`${inputClass} w-1/3 min-w-[120px]`}
                      >
                        <option value="Windows">Windows</option>
                        <option value="Mac">Mac</option>
                        <option value="Linux">Linux</option>
                        <option value="Steam">Steam</option>
                        <option value="PlayStation">PlayStation</option>
                        <option value="Xbox">Xbox</option>
                        <option value="Nintendo">Nintendo</option>
                        <option value="PlayStore">Google Play</option>
                        <option value="AppStore">App Store</option>
                        <option value="Web">Web Browser</option>
                      </select>
                      <input value={link.url} placeholder="https://..." onChange={e => {
                          const newLinks = [...gameForm.platform_links];
                          newLinks[idx].url = e.target.value;
                          setGameForm({...gameForm, platform_links: newLinks});
                        }}
                        className={`${inputClass} flex-1`}
                      />
                      <button onClick={() => {
                          const newLinks = gameForm.platform_links.filter((_, i) => i !== idx);
                          setGameForm({...gameForm, platform_links: newLinks});
                      }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setGameForm({...gameForm, platform_links: [...gameForm.platform_links, {platform: 'Windows', url: ''}]})} className="mt-2 text-primary hover:text-accent font-medium flex items-center gap-1 text-sm bg-primary/10 px-3 py-1.5 rounded-lg w-fit"><Plus className="w-4 h-4" /> Add Link</button>
                </div>
                <ScreenshotUploader
                  screenshots={gameForm.screenshots}
                  onChange={(screenshots) => setGameForm({...gameForm, screenshots})}
                />
              </div>
              <button onClick={async () => { if (gameForm.title) { await addGame(gameForm); setGameForm({ title: "", description: "", genre: "Action", imageUrl: "", releaseDate: "", downloadLink: "", trailerUrl: "", platform_links: [], screenshots: [] }); } }} className="mt-4 gradient-btn px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Game</button>
            </div>
            {games.length === 0 ? <p className="text-center text-muted-foreground py-12">No games yet.</p> : (
              <div className="space-y-3">
                {games.map((g, i) => (
                  <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {g.imageUrl && <img src={g.imageUrl} alt={g.title} className="w-10 h-10 rounded-lg object-cover" />}
                      <div><span className="text-xs text-primary">{g.genre}</span><h4 className="font-semibold text-foreground">{g.title}</h4></div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit("game", g)} className="text-primary hover:bg-primary/10 p-2 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => removeGame(g.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* News Tab */}
        {tab === "news" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Add Announcement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className={inputClass} />
                <select value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} className={inputClass}>
                  {["Release", "Update", "Event", "News"].map((c) => <option key={c}>{c}</option>)}
                </select>
                <input type="date" value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} className={inputClass} />
                <div />
                <textarea placeholder="Content" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} className={`md:col-span-2 ${inputClass} h-20 resize-none`} />
              </div>
              <button onClick={async () => { if (newsForm.title) { await addNews({ ...newsForm, date: newsForm.date || new Date().toLocaleDateString() }); setNewsForm({ title: "", content: "", category: "Release", date: "" }); } }} className="mt-4 gradient-btn px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {news.map((n) => (
              <div key={n.id} className="glass-card p-4 flex items-center justify-between mb-2">
                <div><span className="text-xs text-primary">{n.category}</span><h4 className="font-semibold text-foreground">{n.title}</h4></div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit("news", n)} className="text-primary hover:bg-primary/10 p-2 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => removeNews(n.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQs Tab */}
        {tab === "faqs" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Add FAQ</h3>
              <div className="space-y-4">
                <input placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className={`w-full ${inputClass}`} />
                <textarea placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className={`w-full ${inputClass} h-20 resize-none`} />
              </div>
              <button onClick={async () => { if (faqForm.question) { await addFaq(faqForm); setFaqForm({ question: "", answer: "" }); } }} className="mt-4 gradient-btn px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add FAQ</button>
            </div>
            {faqs.map((f) => (
              <div key={f.id} className="glass-card p-4 flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">{f.question}</h4>
                <div className="flex gap-1">
                  <button onClick={() => startEdit("faq", f)} className="text-primary hover:bg-primary/10 p-2 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => removeFaq(f.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Merch Tab */}
        {tab === "merch" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Add Merchandise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Product Name" value={merchForm.title} onChange={(e) => setMerchForm({ ...merchForm, title: e.target.value })} className={inputClass} />
                <input placeholder="Price" value={merchForm.price} onChange={(e) => setMerchForm({ ...merchForm, price: e.target.value })} className={inputClass} />
                <input placeholder="Purchase Link" value={merchForm.link} onChange={(e) => setMerchForm({ ...merchForm, link: e.target.value })} className={`md:col-span-2 ${inputClass}`} />
                <div className="md:col-span-2"><label className="text-sm text-muted-foreground mb-1 block">Image</label><ImageUpload value={merchForm.imageUrl} onChange={(url) => setMerchForm({ ...merchForm, imageUrl: url })} /></div>
                <textarea placeholder="Description" value={merchForm.description} onChange={(e) => setMerchForm({ ...merchForm, description: e.target.value })} className={`md:col-span-2 ${inputClass} h-20 resize-none`} />
              </div>
              <button onClick={async () => { if (merchForm.title) { await addMerch(merchForm); setMerchForm({ title: "", description: "", price: "", imageUrl: "", link: "" }); } }} className="mt-4 gradient-btn px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {merch.map((m) => (
              <div key={m.id} className="glass-card p-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {m.imageUrl && <img src={m.imageUrl} alt={m.title} className="w-10 h-10 rounded-lg object-cover" />}
                  <div><h4 className="font-semibold text-foreground">{m.title}</h4><span className="text-xs text-primary">{m.price}</span></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit("merch", m)} className="text-primary hover:bg-primary/10 p-2 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => removeMerch(m.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Competitions Tab */}
        {tab === "competitions" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Add Competition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Title" value={compForm.title} onChange={(e) => setCompForm({ ...compForm, title: e.target.value })} className={inputClass} />
                <input placeholder="Game" value={compForm.game} onChange={(e) => setCompForm({ ...compForm, game: e.target.value })} className={inputClass} />
                <input placeholder="Prize" value={compForm.prize} onChange={(e) => setCompForm({ ...compForm, prize: e.target.value })} className={inputClass} />
                <input type="number" placeholder="Max Participants" value={compForm.max_participants} onChange={(e) => setCompForm({ ...compForm, max_participants: e.target.value })} className={inputClass} />
                <input type="date" placeholder="Start Date" value={compForm.start_date} onChange={(e) => setCompForm({ ...compForm, start_date: e.target.value })} className={inputClass} />
                <input type="date" placeholder="End Date" value={compForm.end_date} onChange={(e) => setCompForm({ ...compForm, end_date: e.target.value })} className={inputClass} />
                <select value={compForm.status} onChange={(e) => setCompForm({ ...compForm, status: e.target.value as any })} className={inputClass}>
                  <option value="open">Open</option><option value="ongoing">Ongoing</option><option value="ended">Ended</option>
                </select>
                <input type="number" placeholder="1st Place Points" value={compForm.first_place_points} onChange={(e) => setCompForm({ ...compForm, first_place_points: e.target.value })} className={inputClass} />
                {parseInt(compForm.first_place_points) > 0 && (
                  <div className="md:col-span-2 bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Auto-calculated prize breakdown:</p>
                    <div className="flex flex-wrap gap-3">
                      {[{p:"1st",m:1},{p:"2nd",m:0.7},{p:"3rd",m:0.5},{p:"4th",m:0.3},{p:"5th",m:0.15}].map(r => (
                        <span key={r.p} className="text-xs"><span className="text-primary font-semibold">{r.p}:</span> <span className="text-foreground">{Math.round((parseInt(compForm.first_place_points)||0)*r.m)} pts</span></span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="md:col-span-2"><label className="text-sm text-muted-foreground mb-1 block">Image</label><ImageUpload value={compForm.image_url} onChange={(url) => setCompForm({ ...compForm, image_url: url })} /></div>
                <textarea placeholder="Description" value={compForm.description} onChange={(e) => setCompForm({ ...compForm, description: e.target.value })} className={`md:col-span-2 ${inputClass} h-20 resize-none`} />
              </div>
              <button onClick={async () => { if (compForm.title) { await addCompetition({ ...compForm, max_participants: parseInt(compForm.max_participants) || 100, first_place_points: parseInt(compForm.first_place_points) || 100 }); setCompForm({ title: "", description: "", game: "", start_date: "", end_date: "", prize: "", max_participants: "100", first_place_points: "100", status: "open", image_url: "" }); } }} className="mt-4 gradient-btn px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Competition</button>
            </div>
            {competitions.length === 0 ? <p className="text-center text-muted-foreground py-12">No competitions yet.</p> : (
              <div className="space-y-3">
                {competitions.map((c) => (
                  <div key={c.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {c.image_url && <img src={c.image_url} alt={c.title} className="w-10 h-10 rounded-lg object-cover" />}
                      <div><h4 className="font-semibold text-foreground">{c.title}</h4><span className="text-xs text-primary">{c.status} • {c.game}</span></div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit("competition", c)} className="text-primary hover:bg-primary/10 p-2 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => removeCompetition(c.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {tab === "messages" && <AdminMessages />}

        {/* Points Tab */}
        {tab === "points" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Give Points to User</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="email" placeholder="User email" value={pointsEmail} onChange={(e) => setPointsEmail(e.target.value)} className={inputClass} />
                <input type="number" placeholder="Points amount" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} className={inputClass} />
                <button onClick={async () => { if (pointsEmail && pointsAmount) { await addPointsToUser(pointsEmail, parseInt(pointsAmount)); setPointsEmail(""); setPointsAmount(""); fetchAllUsers().then(setAllUsers); } }} className="gradient-btn px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Points</button>
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-3">All Users</h3>
            {allUsers.length === 0 ? <p className="text-center text-muted-foreground py-12">No users yet.</p> : (
              <div className="space-y-2">{allUsers.map((u) => (
                <div key={u.email} className="glass-card p-4 flex items-center justify-between">
                  <span className="text-sm text-foreground">{u.email}</span>
                  <div className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-yellow-500" /><span className="font-bold text-foreground">{u.points}</span></div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* Shop Tab */}
        {tab === "shop" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Add Shop Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Item Name" value={shopForm.title} onChange={(e) => setShopForm({ ...shopForm, title: e.target.value })} className={inputClass} />
                <input type="number" placeholder="Points Cost" value={shopForm.points_cost} onChange={(e) => setShopForm({ ...shopForm, points_cost: e.target.value })} className={inputClass} />
                <input placeholder="Download Link" value={shopForm.download_link} onChange={(e) => setShopForm({ ...shopForm, download_link: e.target.value })} className={`md:col-span-2 ${inputClass}`} />
                <div className="md:col-span-2"><label className="text-sm text-muted-foreground mb-1 block">Image</label><ImageUpload value={shopForm.image_url} onChange={(url) => setShopForm({ ...shopForm, image_url: url })} /></div>
                <textarea placeholder="Description" value={shopForm.description} onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })} className={`md:col-span-2 ${inputClass} h-20 resize-none`} />
              </div>
              <button onClick={async () => { if (shopForm.title && shopForm.points_cost && shopForm.download_link) { await addShopItem({ ...shopForm, points_cost: parseInt(shopForm.points_cost) }); setShopForm({ title: "", description: "", image_url: "", points_cost: "", download_link: "" }); } }} className="mt-4 gradient-btn px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Item</button>
            </div>
            {shopItems.map((item) => (
              <div key={item.id} className="glass-card p-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {item.image_url && <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />}
                  <div><h4 className="font-semibold text-foreground">{item.title}</h4><div className="flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500" /><span className="text-xs text-primary">{item.points_cost} pts</span></div></div>
                </div>
                <button onClick={() => removeShopItem(item.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

        {/* Rewards Tab */}
        {tab === "rewards" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-1">Reward Claims Log</h3>
              <p className="text-muted-foreground text-sm mb-4">Last 50 voucher claims from the Discord bot reward system</p>
              <button onClick={fetchRewardClaims} className="gradient-btn px-5 py-2 rounded-lg text-sm font-medium">Refresh</button>
            </div>
            {rewardClaims.length === 0 ? <p className="text-center text-muted-foreground py-12">No reward claims yet.</p> : (
              <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left px-5 py-3 text-muted-foreground font-medium">Points</th>
                      <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardClaims.map((claim) => (
                      <tr key={claim.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 text-foreground">{claim.email}</td>
                        <td className="px-5 py-3"><span className="inline-flex items-center gap-1 text-[#39FF14] font-semibold"><Coins className="w-3.5 h-3.5" />+{claim.points}</span></td>
                        <td className="px-5 py-3 text-muted-foreground">{new Date(claim.claimed_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {tab === "stats" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-1">Homepage Stats</h3>
              <p className="text-muted-foreground text-sm mb-6">Edit the stat cards shown on the homepage "Beyond the Screen" section</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "games", valueField: "games_count", labelField: "games_label", title: "Games Stat" },
                  { key: "players", valueField: "players_count", labelField: "players_label", title: "Players Stat" },
                  { key: "awards", valueField: "awards_count", labelField: "awards_label", title: "Awards Stat" },
                  { key: "founded", valueField: "founded_count", labelField: "founded_label", title: "Founded Stat" },
                ].map((stat) => (
                  <div key={stat.key} className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                    <h4 className="text-sm font-medium text-foreground mb-3">{stat.title}</h4>
                    <div className="space-y-2">
                      <input
                        placeholder="Value (e.g. 10K+)"
                        value={(statsForm as any)[stat.valueField]}
                        onChange={(e) => setStatsForm({ ...statsForm, [stat.valueField]: e.target.value })}
                        className={inputClass + " w-full"}
                      />
                      <input
                        placeholder="Label (e.g. Active community)"
                        value={(statsForm as any)[stat.labelField]}
                        onChange={(e) => setStatsForm({ ...statsForm, [stat.labelField]: e.target.value })}
                        className={inputClass + " w-full"}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={async () => { await updateSiteStats(statsForm); }}
                className="mt-6 gradient-btn px-6 py-2.5 rounded-lg text-sm font-medium"
              >
                Save Stats
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      {editingItem && (
        <EditModal title={`Edit ${editType}`} onClose={closeEdit}>
          <div className="space-y-3">
            {editType === "game" && <>
              <input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} placeholder="Title" className={`w-full ${inputClass}`} />
              <select value={editingItem.genre} onChange={(e) => setEditingItem({ ...editingItem, genre: e.target.value })} className={`w-full ${inputClass}`}>
                {["Action", "RPG", "Racing", "Strategy", "Horror", "Adventure", "Puzzle", "Sports"].map((g) => <option key={g}>{g}</option>)}
              </select>
              <textarea value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} placeholder="Description" className={`w-full ${inputClass} h-20 resize-none`} />
              <input value={editingItem.downloadLink || ""} onChange={(e) => setEditingItem({ ...editingItem, downloadLink: e.target.value })} placeholder="Fallback Download Link" className={`w-full ${inputClass}`} />
              <input value={editingItem.trailerUrl || ""} onChange={(e) => setEditingItem({ ...editingItem, trailerUrl: e.target.value })} placeholder="Trailer URL" className={`w-full ${inputClass}`} />
              <div className="space-y-2 mt-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
                <label className="text-sm font-semibold text-foreground mb-2 block">Platform Download Links</label>
                {(editingItem.platform_links || []).map((link: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select value={link.platform} onChange={e => {
                        const newLinks = [...(editingItem.platform_links || [])];
                        newLinks[idx].platform = e.target.value;
                        setEditingItem({...editingItem, platform_links: newLinks});
                      }}
                      className={`${inputClass} w-1/3 min-w-[120px]`}
                    >
                      <option value="Windows">Windows</option>
                      <option value="Mac">Mac</option>
                      <option value="Linux">Linux</option>
                      <option value="Steam">Steam</option>
                      <option value="PlayStation">PlayStation</option>
                      <option value="Xbox">Xbox</option>
                      <option value="Nintendo">Nintendo</option>
                      <option value="PlayStore">Google Play</option>
                      <option value="AppStore">App Store</option>
                      <option value="Web">Web Browser</option>
                    </select>
                    <input value={link.url} placeholder="https://..." onChange={e => {
                        const newLinks = [...(editingItem.platform_links || [])];
                        newLinks[idx].url = e.target.value;
                        setEditingItem({...editingItem, platform_links: newLinks});
                      }}
                      className={`${inputClass} flex-1`}
                    />
                    <button onClick={() => {
                        const newLinks = (editingItem.platform_links || []).filter((_: any, i: number) => i !== idx);
                        setEditingItem({...editingItem, platform_links: newLinks});
                    }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setEditingItem({...editingItem, platform_links: [...(editingItem.platform_links || []), {platform: 'Windows', url: ''}]})} className="mt-2 text-primary hover:text-accent font-medium flex items-center gap-1 text-sm bg-primary/10 px-3 py-1.5 rounded-lg w-fit"><Plus className="w-4 h-4" /> Add Link</button>
              </div>
              <ScreenshotUploader
                screenshots={editingItem.screenshots || []}
                onChange={(screenshots) => setEditingItem({...editingItem, screenshots})}
              />
            </>}
            {editType === "news" && <>
              <input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} placeholder="Title" className={`w-full ${inputClass}`} />
              <textarea value={editingItem.content} onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })} placeholder="Content" className={`w-full ${inputClass} h-20 resize-none`} />
            </>}
            {editType === "faq" && <>
              <input value={editingItem.question} onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })} placeholder="Question" className={`w-full ${inputClass}`} />
              <textarea value={editingItem.answer} onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })} placeholder="Answer" className={`w-full ${inputClass} h-20 resize-none`} />
            </>}
            {editType === "merch" && <>
              <input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} placeholder="Name" className={`w-full ${inputClass}`} />
              <input value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} placeholder="Price" className={`w-full ${inputClass}`} />
              <textarea value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} placeholder="Description" className={`w-full ${inputClass} h-20 resize-none`} />
            </>}
            {editType === "competition" && <>
              <input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} placeholder="Title" className={`w-full ${inputClass}`} />
              <input value={editingItem.game} onChange={(e) => setEditingItem({ ...editingItem, game: e.target.value })} placeholder="Game" className={`w-full ${inputClass}`} />
              <input value={editingItem.prize} onChange={(e) => setEditingItem({ ...editingItem, prize: e.target.value })} placeholder="Prize" className={`w-full ${inputClass}`} />
              <input type="number" value={editingItem.first_place_points || ""} onChange={(e) => setEditingItem({ ...editingItem, first_place_points: parseInt(e.target.value) || 0 })} placeholder="1st Place Points" className={`w-full ${inputClass}`} />
              {(editingItem.first_place_points || 0) > 0 && (
                <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Prize breakdown:</p>
                  <div className="flex flex-wrap gap-3">
                    {[{p:"1st",m:1},{p:"2nd",m:0.7},{p:"3rd",m:0.5},{p:"4th",m:0.3},{p:"5th",m:0.15}].map(r => (
                      <span key={r.p} className="text-xs"><span className="text-primary font-semibold">{r.p}:</span> <span className="text-foreground">{Math.round((editingItem.first_place_points||0)*r.m)} pts</span></span>
                    ))}
                  </div>
                </div>
              )}
              <select value={editingItem.status} onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })} className={`w-full ${inputClass}`}>
                <option value="open">Open</option><option value="ongoing">Ongoing</option><option value="ended">Ended</option>
              </select>
              <textarea value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} placeholder="Description" className={`w-full ${inputClass} h-20 resize-none`} />
            </>}
            <button onClick={saveEdit} className="w-full gradient-btn py-2.5 rounded-lg text-sm font-semibold">Save Changes</button>
          </div>
        </EditModal>
      )}
    </div>
  );
};

export default AdminPage;
