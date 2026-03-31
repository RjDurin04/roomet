import { motion } from 'framer-motion';
import { Phone, ShieldCheck, Info, BedDouble, MessageSquare } from 'lucide-react';

import { AmenityBadge } from './common/AmenityBadge';
import { ContactLink } from './common/ContactLink';
import { RuleItem } from './common/RuleItem';
import { Section } from './common/Section';
import { SectionHeader } from './common/SectionHeader';
import { MapWidget } from './MapWidget';
import { RoomCard } from './RoomCard';

interface InfoTabProps {
  location: { address: string; lng: number; lat: number };
  contact: { phone: string; email: string };
  amenities: string[];
  description: string;
  rooms: {
    name: string;
    gender: string;
    type: string;
    price: number;
    priceType?: string;
    occupied?: number;
    capacity: number;
    amenities?: string[];
  }[];
  rules: string;
}

const MAX_VISIBLE_AMENITIES = 4;

export function InfoTab({
  location,
  contact,
  amenities,
  description,
  rooms,
  rules,
}: InfoTabProps) {
  return (
    <motion.div
      key="identity"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MapWidget {...location} />

        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
          <SectionHeader icon={Phone} title="Contact Details" color="text-primary" />
          <div className="space-y-2">
            <ContactLink href={`tel:${contact.phone}`} label="PH" value={contact.phone} />
            <ContactLink href={`mailto:${contact.email}`} label="EM" value={contact.email} />
          </div>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <SectionHeader icon={ShieldCheck} title="Amenities" color="text-emerald-500" />
          <div className="flex flex-wrap gap-1.5">
            {amenities?.slice(0, MAX_VISIBLE_AMENITIES).map((am, i) => (
              <AmenityBadge key={i} name={am} />
            ))}
            {amenities.length > MAX_VISIBLE_AMENITIES && (
              <span className="text-[8px] font-black opacity-30 text-white leading-5">
                +{amenities.length - MAX_VISIBLE_AMENITIES} MORE
              </span>
            )}
          </div>
        </div>
      </div>

      <Section icon={Info} title="Description" content={<p className="text-sm font-bold leading-relaxed text-white/80 relative z-10">{description}</p>} />

      <Section icon={BedDouble} title="Available Rooms" content={<div className="grid grid-cols-1 gap-3">{rooms?.map((room, i) => <RoomCard key={i} room={room} index={i} />)}</div>} />

      <Section icon={MessageSquare} title="House Rules" color="text-primary/40" content={<div className="space-y-4">{rules.split('\n').filter(l => l.trim()).map((rule, i) => <RuleItem key={i} text={rule} />)}</div>} accent />
    </motion.div>
  );
}
