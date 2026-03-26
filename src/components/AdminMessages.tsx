import { useState } from "react";
import { MessageSquare, Send, Lock, Unlock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, ContactThread } from "@/lib/store";

const AdminMessages = () => {
  const { threads, replyToThread, toggleThreadStatus, removeThread } = useAppStore();
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const filtered = threads.filter((t) => filter === "all" || t.status === filter);

  const handleReply = (threadId: string) => {
    if (!reply.trim()) return;
    replyToThread(threadId, reply, true);
    setReply("");
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["all", "open", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f ? "gradient-btn" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f} ({f === "all" ? threads.length : threads.filter((t) => t.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((thread) => (
              <motion.div
                key={thread.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card overflow-hidden"
              >
                {/* Thread Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setOpenThread(openThread === thread.id ? null : thread.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${thread.status === "open" ? "bg-green-500" : "bg-muted-foreground"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground text-sm">{thread.name}</h4>
                        <span className="text-xs text-muted-foreground">({thread.email})</span>
                      </div>
                      <p className="text-xs text-primary truncate">{thread.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {thread.messages.length} msg{thread.messages.length !== 1 && "s"}
                    </span>
                    {openThread === thread.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Thread */}
                <AnimatePresence>
                  {openThread === thread.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border p-4 space-y-3">
                        {/* Messages */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {thread.messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                                msg.isAdmin
                                  ? "bg-primary/20 border border-primary/30"
                                  : "bg-secondary border border-border"
                              }`}>
                                <p className="text-xs font-medium text-primary mb-1">{msg.from}</p>
                                <p className="text-sm text-foreground">{msg.text}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(msg.date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply (only if open) */}
                        {thread.status === "open" && (
                          <div className="flex gap-2">
                            <input
                              placeholder="Type your reply..."
                              value={reply}
                              onChange={(e) => setReply(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleReply(thread.id); }}
                              className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button onClick={() => handleReply(thread.id)} className="gradient-btn px-4 py-2 rounded-lg">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <button
                            onClick={() => toggleThreadStatus(thread.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              thread.status === "open"
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            }`}
                          >
                            {thread.status === "open" ? <><Lock className="w-3 h-3" /> Close</> : <><Unlock className="w-3 h-3" /> Reopen</>}
                          </button>
                          <button
                            onClick={() => removeThread(thread.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
