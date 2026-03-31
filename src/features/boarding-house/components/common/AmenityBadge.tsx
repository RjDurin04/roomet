export function AmenityBadge({ name }: { name: string }) {
  return (
    <span className="px-2 py-0.5 bg-white/5 text-[8px] font-black uppercase tracking-tight rounded-md border border-white/5">
      {name}
    </span>
  );
}
