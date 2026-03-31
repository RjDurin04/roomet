"use client"; 
/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises */

import { useQuery, useMutation } from 'convex/react';
import { Plus, Loader2, Building2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { api } from '../../../../convex/_generated/api';

import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';

// eslint-disable-next-line max-lines-per-function -- Properties dashboard manages complex UI states
export function MyProperties() {
  const navigate = useNavigate();
  const properties = useQuery(api.properties.listByOwner);
  const deleteProperty = useMutation(api.properties.remove);
  const toggleVisibility = useMutation(api.properties.toggleVisibility);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic data payload from Convex
  const [viewingDetails, setViewingDetails] = useState<any>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    
    setIsDeletingId(id);
    try {
      await deleteProperty({ id });
      setViewingDetails(null);
    } catch (error) {
      console.error("[MyProperties] Delete failed:", error);
      alert("Failed to delete property. Please try again.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsTogglingId(id);
    try {
      await toggleVisibility({ id });
    } catch (error) {
      console.error("[MyProperties] Toggle visibility failed:", error);
    } finally {
      setIsTogglingId(null);
    }
  };

  if (properties === undefined) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const getStatusColor = (isVisible: boolean | undefined, legacyStatus: string | undefined) => {
    const active = isVisible ?? (legacyStatus === "Active");
    return active 
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
      : 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  const getStatusText = (isVisible: boolean | undefined, legacyStatus: string | undefined) => {
    const active = isVisible ?? (legacyStatus === "Active");
    return active ? 'Published' : 'Hidden';
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            My <span className="text-muted-foreground/40 font-light">Properties</span>
          </h1>
          <p className="text-[14px] font-medium text-muted-foreground">
            Manage your boarding house inventory and listings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/owner/properties/deleted"
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-muted text-muted-foreground font-bold text-xs uppercase tracking-widest hover:bg-muted/80 transition-all border border-border/50"
          >
            <Trash2 className="w-4 h-4" />
            Trash
          </Link>
          <button
            onClick={() => navigate('/owner/properties/add')}
            className="group flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            List New Property
          </button>
        </div>
      </header>

      {properties.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/40 backdrop-blur-sm border border-dashed border-primary/20 rounded-[32px] px-6 relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center shadow-inner mb-8 group-hover:scale-110 transition-transform duration-500">
            <Building2 className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-foreground mb-3">No Properties Listed</h3>
          <p className="text-[14px] font-medium text-muted-foreground max-w-sm leading-relaxed">
            You haven't added any properties yet. Start your journey as a host and list your space today to start earning.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic payload */}
          {properties.map((property: any, idx: number) => (
            <PropertyCard
              key={property._id}
              property={property}
              index={idx}
              onViewDetails={() => setViewingDetails(property)}
              onManageImages={() => navigate(`/owner/properties/edit/${property._id}`)}
              onEdit={() => navigate(`/owner/properties/edit/${property._id}`)}
              onToggleVisibility={(e) => handleToggleVisibility(e, property._id)}
              isToggling={isTogglingId === property._id}
              onDelete={(e) => { e.stopPropagation(); handleDelete(property._id, property.name); }}
              isDeleting={isDeletingId === property._id}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          ))}
        </div>
      )}

      {viewingDetails && (
        <PropertyDetailsModal 
          property={viewingDetails} 
          isOpen={!!viewingDetails}
          onClose={() => setViewingDetails(null)}
          onEdit={(id) => navigate(`/owner/properties/edit/${id}`)}
          onDelete={handleDelete}
          isDeleting={isDeletingId === viewingDetails._id}
        />
      )}
    </div>
  );
}
