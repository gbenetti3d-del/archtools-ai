import React, { useRef, useState } from 'react';
import { CompanyConfig } from '../types';
import { emailLogs } from '../services/geminiService';

interface ConfigurationPanelProps {
  config: CompanyConfig;
  setConfig: React.Dispatch<React.SetStateAction<CompanyConfig>>;
  onStartChat: () => void; // This acts as "Exit Config" now
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, setConfig, onStartChat }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogs, setShowLogs] = useState(false);
  
  const handleChange = (field: keyof CompanyConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setConfig(prev => ({
        ...prev,
        context: prev.context + "\n\n--- DOCUMENTO IMPORTADO (" + file.name + ") ---\n" + text
      }));
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in relative z-10">
      <div className="mb-10 text-center relative">
        <button 
          onClick={onStartChat} 
          className="absolute top-0 left-0 text-slate-500 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Sair
        </button>

        <div className="inline-block p-3 rounded-2xl bg-slate-800 text-brand mb-4 shadow-lg border border-slate-700">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3 tracking-tight">Painel Administrativo</h1>
        <p className="text-slate-400 font-sans text-lg max-w-2xl mx-auto">
          Configuração da base de conhecimento e parâmetros da I.A.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl shadow-black/50 border border-slate-800 p-8 space-y-8">
        
        {/* Company Name & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Nome da Organização</label>
            <input 
              type="text" 
              value={config.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none transition-all font-display font-semibold text-lg text-white placeholder-slate-600"
              placeholder="Ex: ArchTools"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Tom de Voz (Persona)</label>
            <div className="relative">
              <select 
                value={config.tone}
                onChange={(e) => handleChange('tone', e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none font-sans text-white font-medium"
              >
                <option value="innovative">Inovador & Tecnológico</option>
                <option value="formal">Corporativo & Formal</option>
                <option value="welcoming">Consultivo & Acolhedor</option>
                <option value="minimalist">Direto & Minimalista</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Website URL */}
        <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">URL do Website</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-700 bg-slate-800 text-slate-500 text-sm">
                https://
              </span>
              <input 
                type="text" 
                value={config.websiteUrl?.replace('https://', '') || ''}
                onChange={(e) => handleChange('websiteUrl', `https://${e.target.value.replace('https://', '')}`)}
                className="w-full bg-slate-800 border border-slate-700 rounded-r-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none transition-all font-sans text-white"
                placeholder="www.archtools.com.br"
              />
            </div>
        </div>

        {/* Knowledge Base */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">
              Base de Conhecimento (Documentos & Dados)
            </label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-all duration-200 transform hover:scale-105 flex items-center gap-1.5 border border-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Importar Documento (.txt/md)
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".txt,.md,.json,.csv"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <div className="relative group">
            <textarea 
              value={config.context}
              onChange={(e) => handleChange('context', e.target.value)}
              className="w-full h-80 bg-slate-800 border border-slate-700 rounded-lg px-4 py-4 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none transition-all font-mono text-sm text-slate-300 leading-relaxed resize-none shadow-inner group-hover:bg-slate-800/80"
              placeholder="Cole aqui o conteúdo de seus PDFs, apresentações institucionais, manuais de venda ou diferenciais competitivos..."
            />
             <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 backdrop-blur-sm">
              {config.context.length} caracteres
            </div>
          </div>
        </div>

        {/* Email Simulation Logs */}
        {emailLogs.length > 0 && (
          <div className="mt-8 border-t border-slate-800 pt-6">
            <button 
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${showLogs ? 'rotate-90' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              Caixa de Saída (Simulação de Servidor) - {emailLogs.length} E-mails
            </button>
            
            {showLogs && (
              <div className="mt-4 bg-black/30 rounded-lg border border-slate-800 p-4 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {emailLogs.map((log) => (
                  <div key={log.id} className="bg-slate-800/50 p-3 rounded border border-slate-700/50 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.type === 'lead' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {log.type === 'lead' ? 'NOVO LEAD' : 'RELATÓRIO'}
                      </span>
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                    </div>
                    <div className="font-bold text-slate-300 mb-1">{log.subject}</div>
                    <div className="text-slate-400 font-mono text-xs whitespace-pre-wrap">{log.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button 
            onClick={onStartChat}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-300 transform hover:scale-105 bg-brand rounded-lg hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
          >
            <span>Salvar e Voltar</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfigurationPanel;