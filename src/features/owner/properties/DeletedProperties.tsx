"use client";
/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises */

import { useQuery, useMutation } from 'convex/react';
import { Loader2, Building2, RotateCcw, ArrowLeft, Info } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../../../convex/_generated/api';

// eslint-disable-next-line max-lines-per-function -- Page-level component
export function DeletedProperties() {
  const navigate = useNavigate();
  const deletedProperties = useQuery(api.properties.listDeleted);
  const restoreProperty = useMutation(api.properties.restore);
  
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  const handleRestore = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to restore ${name}? It will be added back to your properties list as "Hidden".`)) return;
    
    setIsRestoringId(id);
    try {
      await restoreProperty({ id });
    } catch (error) {
      console.error("[DeletedProperties] Restore failed:", error);
      alert("Failed to restore property. Please try again.");
    } finally {
      setIsRestoringId(null);
    }
  };

  if (deletedProperties === undefined) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 md:pb-8 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={() => navigate('/owner/properties')}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Property Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Trash <span className="text-muted-foreground/40 font-light">Bin</span>
          </h1>
          <p className="text-[13px] md:text-[14px] font-medium text-muted-foreground">
            View and restore your previously deleted properties.
          </p>
        </div>
      </header>

      {deletedProperties.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/40 backdrop-blur-sm border border-dashed border-border rounded-[32px] px-6">
          <div className="w-20 h-20 bg-muted rounded-[28px] flex items-center justify-center mb-8">
            <Building2 className="w-10 h-10 text-muted-foreground opacity-40" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-foreground mb-3">Trash is Empty</h3>
          <p className="text-[14px] font-medium text-muted-foreground max-w-sm leading-relaxed">
            You don't have any deleted properties. Deleted listings will appear here for restoration.
          </p>
          <button 
            onClick={() => navigate('/owner/properties')}
            className="mt-6 text-xs font-bold text-primary hover:underline"
          >
            Back to My Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic Convex payload */}
          {deletedProperties.map((property: any) => (
            <div
              key={property._id}
              className="group bg-card rounded-[28px] border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
            >
              <div className="relative h-[180px] w-full overflow-hidden shrink-0 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                <img 
                  src={property.imageUrls?.[0] ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'} 
                  alt={property.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-60 mix-blend-multiply" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                   <h2 className="text-xl font-black text-white line-clamp-1 drop-shadow-md">{property.name}</h2>
                   <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mt-1">Deleted Property</p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-6 flex-1">
                  <p className="text-muted-foreground text-[12px] font-medium leading-relaxed line-clamp-2">
                    {property.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border/50">
                  <button 
                    onClick={() => void handleRestore(property._id, property.name)}
                    disabled={isRestoringId === property._id}
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isRestoringId === property._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Restore Property
                      </>
                    )}
                  </button>
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground" title="View-only in trash">
                    <Info className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
