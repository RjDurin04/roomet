import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Archive, CheckCircle2, Send, Image as ImageIcon, Building2, Inbox, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { validateImageFiles, UPLOAD_LIMITS } from '@/lib/upload-validation';
import { fetchWithTimeout, parseUploadResponse } from '@/lib/fetch-utils';

export function OwnerInquiries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('id');


  const inquiriesRaw = useQuery(api.inquiries.getUserConversations);
  const safeInquiries = (inquiriesRaw || []).filter((inq): inq is NonNullable<typeof inq> => inq !== null);
  const messages = useQuery(api.inquiries.getMessages, activeId ? { conversationId: activeId as Id<"conversations"> } : "skip");

  const sendMessage = useMutation(api.inquiries.sendMessage);
  const markAsRead = useMutation(api.inquiries.markAsRead);
  const deleteConversation = useMutation(api.inquiries.deleteConversation);
  const generateUploadUrl = useMutation(api.properties.generateUploadUrl);

  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{file: File, previewUrl: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMarkedRef = useRef<string | null>(null);

  // Auto scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // RES-C06: Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, [selectedFiles]);

  // RES-H07: Debounced mark-as-read to prevent mutation storms
  useEffect(() => {
    if (!activeId || !messages) return;
    const hasUnread = messages.some(m => !m.isMine && !m.isRead);
    if (!hasUnread) return;
    if (lastMarkedRef.current === activeId) return;
    lastMarkedRef.current = activeId;
    markAsRead({ conversationId: activeId as Id<"conversations"> }).catch(console.error);
  }, [activeId, messages, markAsRead]);

  // Reset mark-as-read tracking when conversation changes
  useEffect(() => {
    lastMarkedRef.current = null;
  }, [activeId]);

  // Autoselect first
  useEffect(() => {
    if (!activeId && safeInquiries.length > 0) {
      setSearchParams({ id: safeInquiries[0].id });
    }
  }, [safeInquiries, activeId, setSearchParams]);

  if (inquiriesRaw === undefined) {
     return <div className="flex bg-background h-full items-center justify-center">Loading inquiries...</div>;
  }

  const filteredInquiries = safeInquiries.filter(i => 
    i?.peer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i?.property?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStrand = safeInquiries.find(i => i.id === activeId);

  const handleSend = async () => {
    if ((!replyText.trim() && selectedFiles.length === 0) || !activeId || isUploading) return;
    
    setIsUploading(true);
    let storageIds: Id<"_storage">[] = [];
    
    try {
      if (selectedFiles.length > 0) {
        const uploads = selectedFiles.map(async ({ file }) => {
           const postUrl = await generateUploadUrl();
           const result = await fetchWithTimeout(postUrl, {
             method: "POST",
             headers: { "Content-Type": file.type },
             body: file,
           }, 30_000);
           const storageId = await parseUploadResponse(result, file.name);
           return storageId as Id<"_storage">;
        });
        storageIds = await Promise.all(uploads);
      }

      await sendMessage({
        conversationId: activeId as Id<"conversations">,
        text: replyText.trim() || undefined,
        images: storageIds.length > 0 ? storageIds : undefined
      });
      
      setReplyText('');
      // SEC-010: Revoke all preview Object URLs before clearing
      selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
      setSelectedFiles([]);
    } catch (error: unknown) {
      // RES-H06: Generic user-facing error, detailed log for debugging
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[OwnerInquiries] Send message failed:', message);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex overflow-hidden bg-background">
      
      {/* List Sidebar */}
      <div className="w-[380px] shrink-0 border-r border-border/50 bg-card flex flex-col h-full relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pb-4 border-b border-border/50">
          <h1 className="text-2xl font-black tracking-tight mb-4">Inbox</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); }}
              placeholder="Search conversations..." 
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full p-3 space-y-1 custom-scrollbar">
          {filteredInquiries.map((inq) => {
            const isActive = activeId === inq.id;

            return (
              <button
                key={inq.id}
                onClick={() => { setSearchParams({ id: inq.id }); }}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative group border ${
                  isActive 
                    ? 'bg-primary/5 border-primary/20 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-muted/50'
                }`}
              >
                {/* Active Indicator & Unread Dot */}
                {isActive && (
                  <motion.div 
                    layoutId="inquiry-active"
                    className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className="flex gap-3 items-start">
                  <div className="relative shrink-0">
                    {inq.peer.image ? (
                        <img src={inq.peer.image} alt={inq.peer.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-background shadow-xs shrink-0" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg ring-2 ring-background shadow-xs shrink-0 text-muted-foreground uppercase">
                           {inq.peer.name.charAt(0)}
                        </div>
                    )}
                    {inq.unreadCount > 0 && !isActive && (
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-primary border-2 border-background rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className={`text-sm truncate pr-2 ${inq.unreadCount > 0 ? 'font-black' : 'font-bold'}`}>{inq.peer.name}</h4>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                        {new Date(inq.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-primary mb-1 flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md bg-primary/10 truncate">
                      <Building2 className="w-3 h-3 shrink-0" /> {inq.property.name}
                    </p>
                    <p className={`text-xs truncate ${inq.unreadCount > 0 && !isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {inq.lastMessageText || 'No messages yet'}
                    </p>
                  </div>
                </div>

                {/* Quick Actions (Hover) */}
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-card/90 backdrop-blur-sm p-1 rounded-lg border border-border shadow-sm transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
          
          {filteredInquiries.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No inquiries found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Conversation Area */}
      {activeStrand ? (
        <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#0A0A0A] relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          
          {/* Header */}
          <div className="h-[88px] px-8 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0">
            <div className="flex items-center gap-4">
              {activeStrand.peer.image ? (
                  <img src={activeStrand.peer.image} alt={activeStrand.peer.name} className="w-12 h-12 rounded-full ring-2 ring-background shadow-sm object-cover" />
              ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-black text-xl ring-2 ring-background shadow-sm text-muted-foreground uppercase">
                    {activeStrand.peer.name.charAt(0)}
                  </div>
              )}
              <div>
                <h2 className="text-lg font-black">{activeStrand.peer.name}</h2>
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online now
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-end justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-0.5">Inquiring about</span>
                <span className="text-xs font-black text-primary flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {activeStrand.property.name}</span>
              </div>
              <button 
                onClick={async () => {
                   if (window.confirm("Are you sure you want to delete this conversation?")) {
                      await deleteConversation({ conversationId: activeId as Id<"conversations"> });
                      setSearchParams({});
                   }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border/50 shadow-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors text-muted-foreground"
                title="Delete Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 relative z-0">
            {messages === undefined ? (
               <div className="text-center py-4 text-xs text-muted-foreground">Loading messages...</div>
            ) : messages.length === 0 ? (
               <div className="text-center py-8 text-sm font-medium text-muted-foreground border-2 border-dashed border-border rounded-xl">No messages yet. Reply to start the conversation!</div>
            ) : (
               messages.map((msg, _idx) => {
                 const isOwner = msg.isMine;
                 
                 return (
                   <motion.div
                     key={msg.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3 }}
                     className={`flex max-w-[80%] ${isOwner ? 'self-end' : 'self-start'}`}
                   >
                     {!isOwner && activeStrand.peer.image && (
                        <img src={activeStrand.peer.image} alt="Avatar" className="w-8 h-8 rounded-full mr-3 mt-auto shrink-0 object-cover" />
                     )}
                     {!isOwner && !activeStrand.peer.image && (
                       <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs mr-3 mt-auto shrink-0 text-muted-foreground uppercase">
                         {activeStrand.peer.name.charAt(0)}
                       </div>
                     )}
                     
                     <div className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}>
                       <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed relative break-words ${
                         isOwner 
                           ? 'bg-primary text-primary-foreground rounded-br-sm shadow-md shadow-primary/20' 
                           : 'bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm'
                       }`}>
                         {/* Legacy single image + New array images */}
                         {(msg.imageUrl || (msg.imageUrls && msg.imageUrls.length > 0)) && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {msg.imageUrl && (
                                 <div onClick={() => { setViewImage(msg.imageUrl!); }} className={`w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border cursor-zoom-in ${isOwner ? 'border-primary-foreground/20 hover:border-primary-foreground/50' : 'border-primary/20 hover:border-primary/50'} transition-all shadow-sm shrink-0`}>
                                    <img src={msg.imageUrl} alt="attached" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 pointer-events-none" />
                                 </div>
                              )}
                              {msg.imageUrls?.map((url: string, imgIdx: number) => (
                                 <div key={imgIdx} onClick={() => { setViewImage(url); }} className={`w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border cursor-zoom-in ${isOwner ? 'border-primary-foreground/20 hover:border-primary-foreground/50' : 'border-primary/20 hover:border-primary/50'} transition-all shadow-sm shrink-0`}>
                                    <img src={url} alt="attached" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 pointer-events-none" />
                                 </div>
                              ))}
                            </div>
                         )}
                         {msg.text && msg.text}
                       </div>
                       <span className="text-[10px] font-bold text-muted-foreground mt-1.5 px-1">
                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         {isOwner && msg.isRead && ' · Read'}
                       </span>
                     </div>
                   </motion.div>
                 );
               })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-card/80 backdrop-blur-xl border-t border-border/50 z-10 sticky bottom-0">
            <div className="flex flex-col gap-3 max-w-4xl mx-auto bg-background border border-border/50 rounded-2xl p-3 shadow-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <input 
                 type="file" 
                 accept="image/*" 
                 multiple
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={e => {
                    if (e.target.files) {
                       const newFiles = Array.from(e.target.files);
                       // SEC-004: Validate file type and size
                       const errors = validateImageFiles(newFiles);
                       if (errors.length > 0) {
                         alert(errors.join('\n'));
                         e.target.value = '';
                         return;
                       }
                       setSelectedFiles(prev => {
                          const combined = [...prev, ...newFiles.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))];
                          if (combined.length > UPLOAD_LIMITS.MAX_CHAT_IMAGES) alert(`Maximum ${UPLOAD_LIMITS.MAX_CHAT_IMAGES} images allowed`);
                          return combined.slice(0, UPLOAD_LIMITS.MAX_CHAT_IMAGES);
                       });
                       e.target.value = '';
                    }
                 }} 
              />
              {selectedFiles.length > 0 && (
                 <div className="flex flex-wrap gap-2 px-1 pt-1">
                    {selectedFiles.map((item, idx) => (
                       <div key={idx} className="relative w-14 h-14 rounded-lg border border-border overflow-hidden shrink-0 group">
                          <img src={item.previewUrl} className="w-full h-full object-cover" />
                          <button onClick={() => { URL.revokeObjectURL(item.previewUrl); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 w-5 h-5 bg-background/80 text-foreground rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm">
                             <X className="w-3 h-3" />
                          </button>
                       </div>
                    ))}
                 </div>
              )}
              <textarea 
                rows={1}
                value={replyText}
                onChange={e => { setReplyText(e.target.value); }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isUploading}
                placeholder={isUploading ? "Sending..." : "Type your reply..."}
                className="w-full bg-transparent resize-none outline-none text-[14px] px-2 py-1 max-h-32 overflow-y-auto disabled:opacity-50"
              />
              <div className="flex justify-between items-center px-1">
                <div className="flex gap-1">
                  <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50" disabled={isUploading}>
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={(!replyText.trim() && selectedFiles.length === 0) || isUploading}
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                >
                  {isUploading ? "Sending..." : "Send"} <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your Messages</h2>
          <p className="text-muted-foreground text-sm font-medium">Select an inquiry from the sidebar to start responding.</p>
        </div>
      )}
      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {viewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setViewImage(null); }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.img 
               initial={{ scale: 0.95 }}
               animate={{ scale: 1 }}
               exit={{ scale: 0.95 }}
               src={viewImage} 
               className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
               onClick={e => { e.stopPropagation(); }}
            />
            <button 
              onClick={() => { setViewImage(null); }}
              className="absolute top-6 right-6 w-12 h-12 bg-background/20 hover:bg-background/80 text-foreground border border-border/50 rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
