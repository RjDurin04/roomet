
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, Map, Bookmark, Inbox, Settings, LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useState } from 'react';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const inquiries = useQuery(api.inquiries.getUserConversations);
  const unreadInquiriesCount = inquiries 
    ? inquiries.reduce((acc, inq) => acc + ((inq?.unreadCount || 0) > 0 ? 1 : 0), 0)
    : 0;

  const nav = [
    { name: 'Dashboard', path: '/tenant', icon: LayoutGrid },
    { name: 'Map', path: '/tenant/map', icon: Map },
    { name: 'Saved', path: '/tenant/bookmarks', icon: Bookmark },
    { name: 'Inbox', path: '/tenant/inquiries', icon: Inbox },
  ];

  const notificationsData = useQuery(api.notifications.get);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const notifications = notificationsData || [];
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-foreground selection:bg-primary/20 font-sans">
      
      {/* Premium Sidebar Design */}
      <aside className="w-[72px] flex-shrink-0 flex flex-col items-center py-6 border-r border-border/50 bg-card z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Brand/Logo */}
        <Link to="/tenant" className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-black text-lg mb-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          R
        </Link>
        
        <nav className="flex flex-col items-center gap-3 w-full px-3">
          {nav.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith('/tenant/map/roomet') && item.path === '/tenant/map');
            const Icon = item.icon;
            const hasBadge = item.name === 'Inbox' && unreadInquiriesCount > 0;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.name}
                className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="main-sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon strokeWidth={isActive ? 2.5 : 2} className="w-[20px] h-[20px] group-hover:scale-110 transition-transform duration-300" />
                  {hasBadge && (
                    <div className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-background ring-0 leading-none shadow-sm">
                      {unreadInquiriesCount > 9 ? '9+' : unreadInquiriesCount}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto flex flex-col items-center gap-3 w-full px-3 pt-6 border-t border-border/50 relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); }}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors relative ${showNotifications ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Bell strokeWidth={2} className="w-[20px] h-[20px]" />
            {unreadNotificationsCount > 0 && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 border border-background" />
            )}
          </button>
          
          <Link to="/tenant/profile" title="Settings" className="flex items-center justify-center w-12 h-12 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
            <Settings strokeWidth={2} className="w-[20px] h-[20px]" />
          </Link>
          <button 
            title="Logout"
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => navigate('/'),
                },
              });
            }}
            className="flex items-center justify-center w-12 h-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut strokeWidth={2} className="w-[20px] h-[20px]" />
          </button>
          <div className="flex items-center justify-center w-12 h-12 mt-2">
            <Link to="/tenant/profile">
              <img 
                src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=333&color=fff&size=40`} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full ring-2 ring-background shadow-md cursor-pointer hover:ring-primary hover:scale-105 transition-all duration-300 object-cover" 
              />
            </Link>
          </div>

          {/* Notifications Flyout */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-16 bottom-16 w-80 bg-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden z-[100]"
              >
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
                  <h3 className="font-bold">Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <button 
                      onClick={() => markAsRead({})}
                      className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => {
                        if (!n.isRead) markAsRead({ notificationId: n._id });
                        navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <p className={`text-sm ${!n.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                      <span className="text-xs text-muted-foreground mt-1 block">{n.body}</span>
                      <span className="text-[10px] text-muted-foreground/50 mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-muted-foreground">
                       <Bell className="w-8 h-8 opacity-20 mx-auto mb-2" />
                       <p className="text-sm font-medium">No notifications yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Workspace Area with subtle background pattern */}
      <main className="flex-1 h-full w-full relative bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col min-w-0 overflow-y-auto">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 w-full h-full">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}
