import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Message, CompanyConfig, UserProfile, UIConfig } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatWindowProps {
  config: CompanyConfig;
  userProfile: UserProfile;
  onBack: () => void;
  uiConfig: UIConfig;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ config, userProfile, onBack, uiConfig }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Olá, ${userProfile.name}. É um prazer atender a ${userProfile.company}.\n\nComo posso auxiliar especificamente no projeto "${userProfile.project}" hoje?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Class for Text Size
  const getTextSizeClass = () => {
    switch (uiConfig.fontSize) {
      case 'small': return 'text-xs md:text-sm';
      case 'large': return 'text-base md:text-lg';
      default: return 'text-sm md:text-base';
    }
  };

  // Optimized Scroll Logic
  useLayoutEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isStreaming = lastMessage?.role === 'model' && lastMessage?.isStreaming;

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: isStreaming ? 'auto' : 'smooth', 
        block: 'end' 
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: msg.feedback === type ? undefined : type } : msg
    ));
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const imageToSend = selectedImage; 
    setSelectedImage(null); 
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isStreaming: true }]);

    try {
      const stream = sendMessageToGemini(userMsg.text, imageToSend || undefined);
      let fullText = "";

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShare = async () => {
    const date = new Date().toLocaleDateString('pt-BR');
    const header = `RELATÓRIO DE ATENDIMENTO - ${config.companyName.toUpperCase()}\nDATA: ${date}\nCLIENTE: ${userProfile.name}\nPROJETO: ${userProfile.project}\n------------------------------------------------\n\n`;

    const chatBody = messages
      .filter(m => m.text)
      .map(m => {
        const role = m.role === 'user' ? userProfile.name.toUpperCase() : 'ARCHTOOLS AI';
        return `[${role}]:\n${m.text}`;
      })
      .join('\n\n');

    const chatSummary = header + chatBody;

    const shareData = {
      title: `Relatório ${userProfile.project} - ArchTools`,
      text: chatSummary,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(chatSummary);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-100px)] md:h-[85vh] max-w-6xl mx-auto bg-brand shadow-2xl shadow-blue-900/50 rounded-lg md:rounded-2xl overflow-hidden border border-white/20 m-2 md:m-6 animate-fade-in relative transition-all duration-300">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg text-xs md:text-sm font-bold flex items-center gap-2 animate-fade-in whitespace-nowrap border border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Relatório copiado para a área de transferência!
        </div>
      )}

      {/* Architectural Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="85%" cy="15%" r="150" stroke="white" strokeWidth="1.5" fill="none" className="opacity-40" />
          <circle cx="85%" cy="15%" r="100" stroke="white" strokeWidth="1" fill="none" className="opacity-30" strokeDasharray="10 5" />
          <path d="M -50 400 L 400 -50" stroke="white" strokeWidth="2" className="opacity-30" />
          <path d="M -50 420 L 420 -50" stroke="white" strokeWidth="1" className="opacity-20" />
          <rect x="10%" y="70%" width="120" height="120" stroke="white" strokeWidth="2" fill="none" className="opacity-30" transform="rotate(15)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-brand/40 to-brand/90"></div>
      </div>

      {/* Header */}
      <div className="bg-brand/80 backdrop-blur-md border-b border-white/10 p-3 md:p-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-lg md:rounded-xl flex-shrink-0 flex items-center justify-center text-white border border-white/20 shadow-lg">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-base md:text-xl text-white tracking-wide truncate">{config.companyName}</h2>
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] md:text-xs text-blue-200 font-medium tracking-wide truncate">{userProfile.project}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button 
            onClick={handleShare}
            className="text-white/70 hover:text-white hover:bg-white/10 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all border border-transparent hover:border-white/10"
            title="Compartilhar relatório"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            <span className="hidden md:inline">Relatório</span>
          </button>
          
          <button 
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all border border-transparent hover:border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden md:inline">Configurar</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 z-10 relative scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 md:gap-3`}>
              {/* Avatar */}
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold border ${
                msg.role === 'user' 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'bg-white text-brand border-white'
              }`}>
                {msg.role === 'user' ? userProfile.name.charAt(0).toUpperCase() : 'AI'}
              </div>

              {/* Bubble */}
              <div 
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm leading-relaxed ${getTextSizeClass()} backdrop-blur-sm ${
                  msg.role === 'user' 
                    ? 'bg-white/10 text-white rounded-tr-none border border-white/20 shadow-inner' 
                    : 'bg-white text-brand rounded-tl-none shadow-xl'
                }`}
              >
                {/* Render Image if exists */}
                {msg.image && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-white/20 bg-black/10">
                    <img src={msg.image} alt="Upload do usuário" className="max-w-full h-auto max-h-64 object-cover" />
                  </div>
                )}

                <p className="whitespace-pre-wrap font-sans break-words">{msg.text}</p>
                {msg.role === 'model' && msg.isStreaming && (
                  <span className="inline-block w-1.5 h-3 md:h-4 ml-1 align-middle bg-brand animate-pulse"></span>
                )}
              </div>
            </div>

            {/* Feedback Actions (Only for Model) */}
            {msg.role === 'model' && !msg.isStreaming && msg.text && (
              <div className="flex items-center gap-2 mt-1 md:mt-2 ml-10 md:ml-12 opacity-80 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleFeedback(msg.id, 'positive')}
                  className={`p-1 md:p-1.5 rounded-full transition-all ${msg.feedback === 'positive' ? 'bg-white/20 text-white scale-110' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                  title="Resposta útil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={msg.feedback === 'positive' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.287 9.463 4.107 9 5.037 9h.54c.465 0 .743.55.513.978a17.511 17.511 0 0 1-1.597 2.457c.48.514.808 1.154.919 1.872a2.475 2.475 0 0 1-.418 1.791l-.168.169Z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleFeedback(msg.id, 'negative')}
                   className={`p-1 md:p-1.5 rounded-full transition-all ${msg.feedback === 'negative' ? 'bg-white/20 text-white scale-110' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                   title="Resposta não útil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={msg.feedback === 'negative' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.817 1.129-5.372 2.978-7.252.388-.481.987-.728 1.605-.728h4.45c.484 0 .965.078 1.424.23l3.113 1.04a4.501 4.501 0 0 0 1.424.23H17.25m-8.913 9.75h10.966c.889 0 1.713.518 1.972 1.368.257.85.52 1.696.83 2.536.436 1.353-.197 2.836-.522 2.836h-.907c-.466 0-.743-.55-.514-.978.43-1.01.733-2.067.892-3.15.112-.718-.216-1.358-.697-1.872a2.475 2.475 0 0 0 .584-1.791l.169-.168a.75.75 0 0 0-.53-1.28h-3.126c-.618 0-.991-.724-.725-1.282a17.925 17.925 0 0 0 .723-3.218 2.25 2.25 0 0 0-2.25-2.25h-.75V7.48c0 .878-.266 1.745-.769 2.508L6.633 15.25Z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start gap-2 md:gap-3">
             <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white text-brand flex items-center justify-center text-[10px] md:text-xs font-bold shadow-lg">AI</div>
             <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl rounded-tl-none shadow-lg flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-5 bg-brand/90 border-t border-white/10 z-20 relative backdrop-blur-md">
        {selectedImage && (
          <div className="mb-2 md:mb-3 flex items-start gap-2 animate-fade-in-up">
            <div className="relative group">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-lg border border-white/30 shadow-md"
              />
              <button 
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-md border border-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <span className="text-[10px] md:text-xs text-white/80 font-medium bg-white/10 border border-white/10 px-2 py-1 rounded">Imagem pronta</span>
          </div>
        )}

        <div className="relative flex items-center shadow-lg rounded-full bg-black/20 border border-white/20 focus-within:bg-black/30 focus-within:border-white/50 transition-all backdrop-blur-md">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ml-1 md:ml-2 p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0 transform active:scale-95"
            title="Anexar imagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={selectedImage ? "O que devo analisar?" : "Digite sua dúvida..."}
            className="w-full bg-transparent text-white placeholder-white/70 rounded-full py-3 md:py-4 pl-2 md:pl-3 pr-10 md:pr-14 focus:outline-none font-sans font-medium disabled:opacity-50 text-base min-w-0"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className="absolute right-1.5 md:right-2 p-2.5 bg-white text-brand rounded-full hover:bg-blue-50 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] md:text-xs text-white/30 mt-2 md:mt-3 font-medium">
          Powered by Gemini • Especializado em {config.companyName}
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;