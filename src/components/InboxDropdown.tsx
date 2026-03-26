import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/lib/notificationStore";

const InboxDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayNotifs = notifications.slice(0, 5); // Show only top 5

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-destructive text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-background"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Bell className="w-8 h-8 opacity-20 mb-3" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {displayNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 transition-colors hover:bg-secondary/50 cursor-default group ${
                        !n.is_read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${!n.is_read ? 'bg-primary shadow-[0_0_8px_rgba(57,255,20,0.6)]' : 'bg-transparent'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm ${!n.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {n.title}
                          </h4>
                          <p className={`text-xs mt-1 leading-relaxed ${!n.is_read ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                            {n.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60 mt-2 block">
                            {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/inbox"
              onClick={() => setIsOpen(false)}
              className="block p-3 text-center text-xs font-semibold text-primary hover:bg-primary/10 transition-colors border-t border-border/50 bg-secondary/20"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InboxDropdown;
