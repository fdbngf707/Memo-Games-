import { useEffect } from "react";
import { Bell, Check, AlertCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificationStore } from "@/lib/notificationStore";
import { useAuthStore } from "@/lib/authStore";
import { useNavigate } from "react-router-dom";

const InboxPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchNotifications(user.email);
    }
  }, [user, navigate, fetchNotifications]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-200px)]">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Your Inbox
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated on your rewards, competition results, and points.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="gradient-btn px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
          {notifications.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-full bg-secondary/50 mb-4 animate-pulse">
                <Bell className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold text-foreground">No recent messages</h2>
              <p className="text-muted-foreground mt-2 max-w-sm">
                When you earn points, buy items, or join competitions, your receipts and alerts will appear here!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-5 sm:p-6 transition-colors hover:bg-secondary/30 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <div className="flex gap-4 sm:gap-6">
                    <div className="flex-shrink-0 mt-1 hidden sm:block">
                      <div className={`p-3 rounded-xl ${!n.is_read ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {n.title.toLowerCase().includes('points') || n.title.toLowerCase().includes('reward') ? (
                          <AlertCircle className="w-6 h-6" />
                        ) : n.title.toLowerCase().includes('competition') ? (
                          <Bell className="w-6 h-6" />
                        ) : (
                          <Bell className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`text-lg sm:text-xl font-display ${!n.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}>
                          {n.title}
                          {!n.is_read && (
                            <span className="ml-3 inline-block px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider align-middle relative -top-0.5">
                              New
                            </span>
                          )}
                        </h3>
                        <span className="flex-shrink-0 text-xs text-muted-foreground flex items-center gap-1.5 whitespace-nowrap bg-secondary/50 px-2.5 py-1 rounded-full">
                          <Calendar className="w-3 h-3" />
                          {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <p className={`mt-2 sm:mt-3 leading-relaxed text-sm sm:text-base ${!n.is_read ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                        {n.message}
                      </p>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-xs text-muted-foreground/50">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!n.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            className="text-xs text-primary hover:text-white transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InboxPage;
