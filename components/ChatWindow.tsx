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
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
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

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    setIsAnalysing(true);
    
    // Preparar histórico para análise
    const chatHistory = messages
      .filter(m => m.text)
      .map(m => `[${m.role === 'user' ? 'CLIENTE' : 'ARCHTOOLS AI'}]: ${m.text}`)
      .join('\n');

    // Import function dynamically to avoid circular dependencies
    const { generateSessionReport } = await import('../services/geminiService');
    
    // Gerar Relatório Inteligente
    const reportSummary = await generateSessionReport(chatHistory);

    setIsAnalysing(false);

    const date = new Date().toLocaleDateString('pt-BR');
    const header = `RELATÓRIO DE ATENDIMENTO - ${config.companyName.toUpperCase()}\nDATA: ${date}\nCLIENTE: ${userProfile.name}\nPROJETO: ${userProfile.project}\n------------------------------------------------\n\n`;

    const fullText = header + reportSummary;

    const shareData = {
      title: `Relatório ${userProfile.project} - ArchTools`,
      text: fullText,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(fullText);
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
            disabled={isAnalysing}
            className="text-white/70 hover:text-white hover:bg-white/10 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all border border-transparent hover:border-white/10 disabled:opacity-50"
            title="Compartilhar relatório"
          >
            {isAnalysing ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            )}
            <span className="hidden md:inline">{isAnalysing ? 'Analisando...' : 'Relatório'}</span>
          </button>
          
          <button 
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all border border-transparent hover:border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden md:inline">Início</span>
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

              <div className="flex flex-col gap-1 w-full">
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

                {/* AI Actions Row */}
                {msg.role === 'model' && !msg.isStreaming && (
                  <div className="flex items-center gap-2 ml-1">
                    <button 
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="text-white/40 hover:text-white flex items-center gap-1 text-[10px] md:text-xs transition-colors p-1"
                      title="Copiar resposta"
                    >
                      {copiedMessageId === msg.id ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-emerald-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          <span className="text-emerald-400 font-medium">Copiado</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                          </svg>
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Skeleton Loader Animation for AI Response */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex flex-col items-start w-full animate-fade-in">
             <div className="flex max-w-[85%] md:max-w-[75%] flex-row gap-2 md:gap-3">
               {/* Skeleton Avatar */}
               <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 bg-white/20 animate-pulse border border-white/10"></div>
               
               {/* Skeleton Bubble */}
               <div className="p-4 md:p-5 rounded-xl md:rounded-2xl rounded-tl-none shadow-xl bg-white w-full space-y-3 relative overflow-hidden">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]"></div>
                  
                  {/* Content Lines */}
                  <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                  <div className="space-y-2 pt-1">
                     <div className="h-3 bg-slate-100 rounded w-full animate-pulse"></div>
                     <div className="h-3 bg-slate-100 rounded w-[90%] animate-pulse"></div>
                     <div className="h-3 bg-slate-100 rounded w-[95%] animate-pulse"></div>
                     <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse"></div>
                  </div>
               </div>
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