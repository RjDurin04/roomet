interface RoomCardProps {
  room: {
    name: string;
    gender: string;
    type: string;
    price: number;
    priceType?: string;
    occupied?: number;
    capacity: number;
    amenities?: string[];
  };
  index: number;
}

export function RoomCard({ room, index }: RoomCardProps) {
  return (
    <div className="flex flex-col p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black text-white/20">#{index + 1}</span>
          <h4 className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">
            {room.name}
          </h4>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[7px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md border border-white/10">
            {room.gender}
          </span>
          <span className="text-[7px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/10">
            {room.type}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-black text-primary leading-none tracking-tighter">
            ₱{room.price?.toLocaleString()}
          </div>
          <div className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">
            /{room.priceType || 'slot'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-widest">
            {room.occupied || 0} <span className="opacity-30">/</span> {room.capacity}
          </div>
          <div className="text-[7px] font-bold uppercase tracking-widest opacity-20">Occupancy</div>
        </div>
      </div>
      {room.amenities && room.amenities.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-1 pt-4 mt-4 border-t border-white/5">
          {room.amenities.map((am: string, idx: number) => (
            <span
              key={idx}
              className="text-[7px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1.5"
            >
              <div className="w-1 h-1 bg-primary/40 rounded-full" /> {am}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
