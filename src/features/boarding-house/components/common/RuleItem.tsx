export function RuleItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
      <p className="text-xs font-medium leading-relaxed text-white/60">{text}</p>
    </div>
  );
}
