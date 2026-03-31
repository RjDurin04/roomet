import { TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Property {
  _id: string;
  imageUrls?: string[];
  name: string;
  rating?: number;
}

interface TopPerformingPropertiesProps {
  properties: Property[];
}

export function TopPerformingProperties({ properties }: TopPerformingPropertiesProps) {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-8 bg-card border border-border rounded-[2rem] overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Top Performing Listings
        </h3>
        <button
          onClick={() => { void navigate('/owner/properties'); }}
          className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
        >
          Browse All
        </button>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {properties.map((bh: any) => (
            <div
              key={bh._id}
              onClick={() => { void navigate(`/owner/properties?id=${bh._id}`); }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden shrink-0 bg-muted border border-border/40">
                <img
                  src={bh.imageUrls?.[0] ?? ''}
                  alt={bh.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-[12px] md:text-[13px] font-black truncate uppercase tracking-tight italic">
                  {bh.name}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[9px] uppercase font-bold text-primary tracking-widest">
                    Active Status
                  </p>
                  <div className="flex items-center gap-1 text-[10px] md:text-[11px] font-black text-amber-500">
                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" /> {bh.rating || 'New'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-muted-foreground text-[12px] italic">
          Add your first property to start tracking performance!
        </div>
      )}
    </div>
  );
}
