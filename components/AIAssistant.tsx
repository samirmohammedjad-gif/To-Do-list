
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Copy, Check, Paperclip, ArrowUp, User, ChevronRight, PanelRight, Plus, MessageSquare, ArrowLeft } from 'lucide-react';
import { chatWithGenie } from '../services/geminiService';
import { Task, ScheduleBlock, Course, ChatMessage, UserStats, ResourceItem, ChatSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AIAssistantProps {
  tasks: Task[];
  schedule: ScheduleBlock[];
  courses: Course[];
  chatHistory: ChatSession[];
  onSaveSession: (session: ChatSession) => void;
  onExit: () => void;
}

const ChatGPTIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.0462 6.0462 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4533l-.142.0805L8.704 5.4596a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
);

const AIAssistant: React.FC<AIAssistantProps> = ({ tasks, schedule, courses, chatHistory, onSaveSession, onExit }) => {
  const { t, dir } = useLanguage();
  const [input, setInput] = useState('');
  
  // Current Session State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Load last session on mount if available, else start new
  useEffect(() => {
    // Optionally load last session here
  }, []);

  // Sync current messages to persistent storage
  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
        // Generate a simple title from first message
        const firstMsg = messages[0].content;
        const title = firstMsg.length > 25 ? firstMsg.substring(0, 25) + '...' : firstMsg;
        
        onSaveSession({
            id: currentSessionId,
            title: title || 'محادثة جديدة',
            messages: messages,
            lastModified: Date.now()
        });
    }
  }, [messages, currentSessionId]);

  const startNewChat = () => {
      setMessages([]);
      setCurrentSessionId(null);
      setIsSidebarOpen(false);
  };

  const loadSession = (session: ChatSession) => {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setIsSidebarOpen(false);
  };

  const getExtraContext = () => {
    try {
        const statsStr = localStorage.getItem('db_stats');
        const resourcesStr = localStorage.getItem('db_resources');
        return {
            stats: statsStr ? JSON.parse(statsStr) : { level: 1, xp: 0, streakDays: 0, masteryScore: 0 },
            resources: resourcesStr ? JSON.parse(resourcesStr) : []
        };
    } catch {
        return { stats: { level: 1, xp: 0 }, resources: [] };
    }
  };

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' });
    }
  }, [messages, isTyping]);

  // Auto resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return;

    // Initialize session ID if first message
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
        activeSessionId = Date.now().toString();
        setCurrentSessionId(activeSessionId);
    }

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input || (selectedImage ? 'تم إرسال صورة' : ''),
        timestamp: Date.now()
    };
    
    const currentImage = selectedImage;

    // Update UI immediately
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);
    
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';

    // Prepare full context
    const extra = getExtraContext();
    const context = { 
        tasks, 
        schedule, 
        courses,
        stats: extra.stats as UserStats,
        resources: extra.resources as ResourceItem[]
    };

    // Call AI with HISTORY
    const responseText = await chatWithGenie(userMsg.content, newHistory, context, currentImage || undefined);

    const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = [
      'ما هي المهام المتبقية اليوم؟',
      'قيم مستواي في الفيزياء',
      'عندي امتحان فيزياء بكرة، أعمل إيه؟',
      'نظم لي جدول للمتراكم'
  ];

  return (
    // Main Container - OpenAI Dark Theme (#212121)
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#212121] text-gray-800 dark:text-gray-100 font-sans fixed inset-0 z-[60]">
        
        {/* --- TOP HEADER (Navigation) --- */}
        <div className="flex justify-between items-center p-4 bg-white dark:bg-[#212121] z-20 absolute top-0 w-full border-b border-black/5 dark:border-white/5">
            {/* Right in RTL (Start): History Menu */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2f2f2f] text-gray-600 dark:text-gray-300 transition-colors"
                title="سجل المحادثات"
            >
                <PanelRight className="w-6 h-6" />
            </button>

            {/* Title - Centered */}
            <div className="bg-gray-100 dark:bg-[#2f2f2f] px-4 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-[#383838] transition-colors cursor-default">
                <span className="font-bold text-sm text-gray-700 dark:text-gray-200">ChatGPT 4o mini</span>
            </div>

            {/* Left in RTL (End): Exit/Back */}
            <button 
                onClick={onExit}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2f2f2f] text-gray-600 dark:text-gray-300 transition-colors"
                title="خروج"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
        </div>

        {/* --- SIDEBAR (History) --- */}
        <div 
          className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
        >
            <div 
               className={`absolute top-0 bottom-0 right-0 w-[260px] bg-[#171717] text-gray-100 p-4 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
               onClick={(e) => e.stopPropagation()}
            >
                {/* New Chat Button */}
                <button 
                   onClick={startNewChat}
                   className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#212121] transition-colors mb-4 border border-white/10"
                >
                    <div className="bg-white text-black p-1 rounded-full">
                        <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">محادثة جديدة</span>
                </button>

                {/* History List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    <p className="text-xs font-bold text-gray-500 px-2 mb-2">السجل</p>
                    {chatHistory.map((session) => (
                        <button
                           key={session.id}
                           onClick={() => loadSession(session)}
                           className={`w-full text-start flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm ${currentSessionId === session.id ? 'bg-[#212121]' : 'hover:bg-[#212121]'}`}
                        >
                            <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate flex-1">{session.title}</span>
                        </button>
                    ))}
                    {chatHistory.length === 0 && (
                        <p className="text-center text-gray-600 text-sm py-4">لا يوجد محادثات سابقة</p>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="pt-4 border-t border-white/10 mt-auto">
                    <button className="flex items-center gap-3 px-2 py-3 w-full hover:bg-[#212121] rounded-lg transition-colors">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium">طالب ثانوية (بطل الحكاية)</span>
                    </button>
                </div>
            </div>
        </div>
        
        {/* --- SCROLLABLE CHAT AREA --- */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pt-16" ref={scrollRef}>
            {messages.length === 0 ? (
                /* Empty State (Centered Logo) */
                <div className="flex flex-col items-center justify-center h-full px-4 text-center pb-20 animate-fade-in-up">
                    
                    {/* Bismillah Header */}
                    <div className="mb-6 opacity-60">
                        <h2 className="text-xl md:text-2xl font-amiri text-gray-500 dark:text-gray-400">
                            بسم الله الرحمن الرحيم
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-[#212121] p-4 rounded-full mb-4 shadow-sm border border-black/5 dark:border-white/5">
                        <ChatGPTIcon className="w-16 h-16 text-gray-300 dark:text-white/80" />
                    </div>
                    
                    <p className="text-lg font-bold text-gray-800 dark:text-white mb-8">
                       أهلاً يا بطل! عامل إيه النهاردة؟
                    </p>

                    {/* Suggestions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
                        {suggestions.map((s, idx) => (
                           <button 
                             key={idx}
                             onClick={() => setInput(s)} 
                             className="border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-start hover:bg-gray-50 dark:hover:bg-[#2f2f2f] transition-colors text-sm font-medium text-gray-600 dark:text-gray-300"
                           >
                              {s}
                           </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* Chat Messages List */
                <div className="flex flex-col w-full max-w-3xl mx-auto py-6 px-4 gap-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 w-full group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                           
                           {/* Avatar - Assistant Only */}
                           {msg.role === 'assistant' ? (
                               <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-black/5 dark:border-white/10 bg-white dark:bg-transparent">
                                    <ChatGPTIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                               </div>
                           ) : (
                               // Remove User Avatar completely
                               <div className="w-8 h-8 shrink-0"></div> 
                           )}
                           
                           {/* Content */}
                           <div className={`flex flex-col max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className="font-bold text-sm mb-1 text-gray-900 dark:text-white select-none">
                                  {msg.role === 'assistant' ? 'ChatGPT' : 'You'}
                              </div>
                              
                              {msg.role === 'user' && msg.content === 'تم إرسال صورة' && (
                                  <div className="flex items-center gap-2 text-gray-500 italic mb-1 text-sm bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                                      <ImageIcon className="w-3 h-3" /> صورة مرفقة
                                  </div>
                              )}
                              
                              <div className="text-[15px] md:text-base leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-[#ececec]">
                                 {msg.content}
                              </div>

                              {/* Copy Tool (Assistant Only) */}
                              {msg.role === 'assistant' && (
                                  <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                         onClick={() => handleCopy(msg.content, msg.id)}
                                         className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                                         title="Copy"
                                       >
                                           {copiedId === msg.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                       </button>
                                  </div>
                              )}
                           </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-4 w-full animate-fade-in">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center border border-black/5 dark:border-white/10 shrink-0">
                                <ChatGPTIcon className="w-5 h-5 text-gray-800 dark:text-white" />
                             </div>
                             <div className="flex items-center gap-1 mt-3">
                                 <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                 <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                 <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* --- INPUT AREA (Fixed Bottom) --- */}
        <div className="w-full p-4 bg-white dark:bg-[#212121]">
            <div className="max-w-3xl mx-auto relative">
                
                {/* Image Preview */}
                {selectedImage && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-100 dark:bg-[#2f2f2f] rounded-xl border border-gray-200 dark:border-gray-600 animate-fade-in-up">
                        <div className="relative">
                            <img src={selectedImage} alt="Preview" className="h-16 w-auto rounded-lg object-cover" />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Input Container */}
                <div className="bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[26px] px-3 py-3 flex items-end gap-2 ring-offset-2 focus-within:ring-1 ring-black/5 dark:ring-white/10 transition-shadow">
                    
                    {/* Attachment Icon */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors rounded-full flex-shrink-0 mb-0.5"
                    >
                        <Paperclip className="w-5 h-5 rtl:-scale-x-100" />
                    </button>

                    {/* Text Area */}
                    <textarea 
                        ref={textAreaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Message ChatGPT"
                        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base py-2 px-2 resize-none max-h-[200px] focus:outline-none custom-scrollbar dir-auto leading-relaxed"
                        rows={1}
                        style={{ minHeight: '24px' }}
                    />

                    {/* Send Button */}
                    <button 
                        onClick={handleSend}
                        disabled={(!input.trim() && !selectedImage) || isTyping}
                        className={`p-2 rounded-full mb-0.5 transition-all duration-200 ${
                            (input.trim() || selectedImage) && !isTyping
                            ? 'bg-black dark:bg-white text-white dark:text-black' 
                            : 'bg-transparent text-gray-300 dark:text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="text-center mt-2.5">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">ChatGPT can make mistakes. Check important info.</p>
                </div>
            </div>

            {/* Hidden Input */}
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageSelect}
            />
        </div>
    </div>
  );
};

export default AIAssistant;
