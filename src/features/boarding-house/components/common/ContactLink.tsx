export function ContactLink({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <a href={href} className="block text-[11px] font-black hover:text-primary transition-colors truncate">
      <span className="opacity-30 font-normal mr-2">{label}</span> {value}
    </a>
  );
}
