/* eslint-disable max-lines -- High fidelity UI component integrating layout, input, and feeds */
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search as SearchIcon, ShieldCheck, MapPin, ExternalLink, Image as ImageIcon, Trash2, X, AlertCircle, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

import { fetchWithTimeout, parseUploadResponse } from '@/lib/fetch-utils';
import { validateImageFiles, UPLOAD_LIMITS } from '@/lib/upload-validation';

const MOBILE_BREAKPOINT = 768;
const UPLOAD_TIMEOUT_MS = 30_000;

// eslint-disable-next-line max-lines-per-function, complexity -- High fidelity chat integrates multiple states and interactive flows
export function Inquiries() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('id');


  const conversations = useQuery(api.inquiries.getUserConversations);
  const messages = useQuery(api.inquiries.getMessages, activeId ? { conversationId: activeId as Id<"conversations"> } : "skip");
  
  const sendMessage = useMutation(api.inquiries.sendMessage);
  const markAsRead = useMutation(api.inquiries.markAsRead);
  const deleteConversation = useMutation(api.inquiries.deleteConversation);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{file: File, previewUrl: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMarkedRef = useRef<string | null>(null);

  // Auto scroll to bottom
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

  // Auto-select first conversation if none selected (desktop only)
  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) {
      if (window.innerWidth < MOBILE_BREAKPOINT) return; // Don't auto-select on mobile
      const firstValid = conversations.find(c => c !== null);
      if (firstValid) setSearchParams({ id: firstValid.id });
    }
  }, [conversations, activeId, setSearchParams]);

  if (conversations === undefined) {
    return <div className="flex-1 flex items-center justify-center">Loading conversations...</div>;
  }

  const filteredChats = conversations.filter((c): c is NonNullable<typeof c> => c !== null).filter(c => 
    c.peer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.property.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChat = conversations.filter((c): c is NonNullable<typeof c> => c !== null).find(c => c.id === activeId);

  const handleSend = async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || !activeId || isUploading) return;
    
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
           }, UPLOAD_TIMEOUT_MS);
           const storageId = await parseUploadResponse(result, file.name);
           return storageId as Id<"_storage">;
        });
        storageIds = await Promise.all(uploads);
      }

      const payload: Record<string, unknown> = { conversationId: activeId };
      if (inputValue.trim()) payload.text = inputValue.trim();
      if (storageIds.length > 0) payload.images = storageIds;
      await sendMessage(payload);
      
      setInputValue('');
      // SEC-010: Revoke all preview Object URLs before clearing
      selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
      setSelectedFiles([]);
    } catch (error: unknown) {
      // RES-H06: Generic user-facing error, detailed log for debugging
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Inquiries] Send message failed:', message);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      
      {/* Left Pane - Conversation List */}
      <div className={`w-full md:w-[340px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full ${activeId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Messages</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {conversations.reduce((acc, c) => acc + (c?.unreadCount ?? 0), 0)} unread
            </span>
          </div>
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); }}
              placeholder="Search conversations..." 
              className="w-full h-9 bg-muted/50 border border-border/50 focus:border-ring rounded-lg pl-9 pr-4 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/60" 
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => {
            const isActive = activeId === chat.id;
            return (
              <div 
                key={chat.id} 
                onClick={() => { setSearchParams({ id: chat.id }); }}
                className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-all border-b border-border/30 ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30 border-l-2 border-l-transparent'}`}
              >
                <div className="relative shrink-0">
                  {chat.peer.image ? (
                     <img src={chat.peer.image} alt={chat.peer.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-background shadow-xs shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'} uppercase`}>
                      {chat.peer.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold text-[13px] truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>{chat.peer.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[11px] text-muted-foreground/80 truncate">{chat.property.name}</p>
                    {(!chat.property.isVisible || chat.property.status === "Deleted") && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-destructive/10 text-destructive border border-destructive/20 scale-90 origin-left">Inactive</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[12px] truncate pr-2 ${chat.unreadCount > 0 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                      {chat.lastMessageText || 'No messages yet'}
                    </p>
                    {chat.unreadCount > 0 && <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground shrink-0">{chat.unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm font-medium">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-background relative min-w-0">
          {/* Chat Header */}
          <div className="h-[72px] border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 pr-2">
              <button 
                onClick={() => setSearchParams({})}
                className="md:hidden flex items-center justify-center w-8 h-8 -ml-1 text-muted-foreground hover:bg-muted rounded-full transition-colors shrink-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="relative shrink-0">
                {activeChat.peer.image ? (
                   <img src={activeChat.peer.image} alt={activeChat.peer.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-background shadow-xs shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[13px] uppercase">
                    {activeChat.peer.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[14px] flex items-center gap-1.5 truncate">
                  <span className="truncate">{activeChat.peer.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                </h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                  <span className="text-green-500 font-medium shrink-0">Online</span> 
                  <span className="text-border shrink-0">·</span> 
                  <span className="truncate">Owner of {activeChat.property.name}</span>
                  {(!activeChat.property.isVisible || activeChat.property.status === "Deleted") && (
                    <span className="ml-1 text-destructive font-black uppercase text-[8px] tracking-widest shrink-0">· Inactive</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => { void navigate(`/tenant/map/roomet/${activeChat.property.id}`); }}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                title="View listing"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                   void (async () => {
                     if (window.confirm("Are you sure you want to delete this conversation?")) {
                        await deleteConversation({ conversationId: activeId as Id<"conversations"> });
                        setSearchParams({});
                     }
                   })();
                }}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                title="Delete Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Availability Banner */}
          {(!activeChat.property.isVisible || activeChat.property.status === "Deleted") && (
             <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-[11px] font-bold text-destructive">
                   This property is no longer active. Some details may be outdated or the listing may have been removed.
                </p>
             </div>
          )}

          {/* Property Context Card */}
          <div 
            onClick={() => { void navigate(`/tenant/map/roomet/${activeChat.property.id}`); }}
            className={`mx-6 mt-4 flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors group z-0 ${(!activeChat.property.isVisible || activeChat.property.status === "Deleted") ? 'opacity-70 grayscale-[0.5]' : ''}`}
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50 relative">
              <img src={activeChat.property.image ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'} alt="" className="w-full h-full object-cover" />
              {(!activeChat.property.isVisible || activeChat.property.status === "Deleted") && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[7px] font-black text-white uppercase tracking-tighter">Inactive</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] truncate group-hover:text-primary transition-colors">{activeChat.property.name}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" />{activeChat.property.address}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1.5 rounded-md">See Details</div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-1 relative z-0">
            <div className="text-center my-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-muted/50 px-3 py-1 rounded-full">Conversation Started</span>
            </div>
            
            {messages === undefined ? (
              <div className="text-center py-4 text-xs text-muted-foreground">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-sm font-medium text-muted-foreground border-2 border-dashed border-border rounded-xl my-4">No messages yet. Say hi!</div>
            ) : (
              // eslint-disable-next-line complexity -- Chat message requires granular rendering logic
              messages.map((msg, i) => {
                const isUser = msg.isMine;
                const showAvatar = i === 0 || messages[i - 1]?.senderId !== msg.senderId;
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-0.5'}`}
                  >
                    {!isUser && showAvatar && activeChat.peer.image && (
                       <img src={activeChat.peer.image} alt="Avatar" className="w-7 h-7 rounded-full object-cover mt-1 shrink-0" />
                    )}
                    {!isUser && showAvatar && !activeChat.peer.image && (
                      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 uppercase">
                        {activeChat.peer.name.charAt(0)}
                      </div>
                    )}
                    {!isUser && !showAvatar && <div className="w-7 shrink-0" />}
                    <div className={`max-w-[70%] ${isUser 
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md' 
                      : 'bg-card border border-border/50 text-foreground rounded-2xl rounded-bl-md'
                    } px-4 py-2.5 shadow-sm`}>
                      {/* Legacy single image + New array images */}
                      {(msg.imageUrl || (msg.imageUrls && msg.imageUrls.length > 0)) && (
                         <div className="flex flex-wrap gap-2 mb-2">
                           {msg.imageUrl && (
                              <div onClick={() => { setViewImage(msg.imageUrl!); }} className={`w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border cursor-zoom-in ${isUser ? 'border-primary-foreground/20 hover:border-primary-foreground/50' : 'border-primary/20 hover:border-primary/50'} transition-all shadow-sm shrink-0`}>
                                 <img src={msg.imageUrl} alt="attached" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 pointer-events-none" />
                              </div>
                           )}
                           {msg.imageUrls?.map((url: string, imgIdx: number) => (
                              <div key={imgIdx} onClick={() => { setViewImage(url); }} className={`w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border cursor-zoom-in ${isUser ? 'border-primary-foreground/20 hover:border-primary-foreground/50' : 'border-primary/20 hover:border-primary/50'} transition-all shadow-sm shrink-0`}>
                                 <img src={url} alt="attached" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 pointer-events-none" />
                              </div>
                           ))}
                         </div>
                      )}
                      {msg.text && <p className="text-[13px] leading-relaxed break-words">{msg.text}</p>}
                      <p className={`text-[9px] mt-1.5 ${isUser ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isUser && msg.isRead && ' · Read'}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-card/50 backdrop-blur border-t border-border/50 shrink-0 z-10 sticky bottom-0">
            <div className="flex flex-col gap-3 bg-background border border-border/50 rounded-2xl p-3 shadow-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
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
                         const target = e.target as HTMLInputElement;
                         alert(errors.join('\n'));
                         target.value = '';
                         return;
                       }
                       setSelectedFiles(prev => {
                          const combined = [...prev, ...newFiles.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))];
                          if (combined.length > UPLOAD_LIMITS.MAX_CHAT_IMAGES) alert(`Maximum ${UPLOAD_LIMITS.MAX_CHAT_IMAGES} images allowed`);
                          return combined.slice(0, UPLOAD_LIMITS.MAX_CHAT_IMAGES);
                       });
                       const t = e.target as HTMLInputElement;
                       t.value = '';
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
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                disabled={isUploading}
                placeholder={isUploading ? "Sending..." : "Type your message..."}
                className="w-full bg-transparent resize-none outline-none text-[14px] px-2 py-1 max-h-32 overflow-y-auto disabled:opacity-50"
              />
              <div className="flex justify-between items-center px-1">
                <div className="flex gap-1">
                  <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50" disabled={isUploading}>
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => { void handleSend(); }}
                  disabled={(!inputValue.trim() && selectedFiles.length === 0) || isUploading}
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isUploading ? "Sending..." : "Send"} <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center text-muted-foreground font-medium text-sm">
          Select a conversation from the sidebar.
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
