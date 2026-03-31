import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatRelativeTime } from '@/lib/utils';

interface Inquiry {
  id: string;
  avatar: string;
  user: string;
  unread: boolean;
  updatedAt: number;
  property: string;
  message: string;
}

interface RecentActivityProps {
  recentInquiries: Inquiry[];
}

export function RecentActivity({ recentInquiries }: RecentActivityProps) {
  return (
    <div className="lg:col-span-5 flex flex-col bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm h-full lg:min-h-0">
      <div className="flex items-center justify-between p-6 pb-2 border-b border-border/40">
        <h2 className="text-[14px] font-bold uppercase tracking-widest">Recent Activity</h2>
        <Link to="/owner/inquiries" className="text-[11px] font-bold text-primary hover:underline">
          View Inbox
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <div className="space-y-1">
          {recentInquiries.length > 0 ? (
            recentInquiries.map((inq) => (
              <Link
                key={inq.id}
                to={`/owner/inquiries?id=${inq.id}`}
                className="group flex gap-3 p-3.5 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer border border-transparent"
              >
                <div className="relative">
                  <img
                    src={inq.avatar}
                    alt={inq.user}
                    className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm"
                  />
                  {inq.unread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-[13px] group-hover:text-primary transition-colors truncate">
                      {inq.user}
                    </h4>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap ml-2 italic">
                      {formatRelativeTime(inq.updatedAt)}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-primary mb-0.5 truncate">{inq.property}</p>
                  <p
                    className={`text-[12px] truncate ${
                      inq.unread ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {inq.message}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
              <Inbox className="w-10 h-10 opacity-20" />
              <p className="text-[12px]">No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
