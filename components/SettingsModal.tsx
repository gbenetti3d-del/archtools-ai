import React from 'react';
import { UIConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UIConfig;
  setConfig: React.Dispatch<React.SetStateAction<UIConfig>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, setConfig }) => {
  if (!isOpen) return null;

  const handleFontSizeChange = (size: 'small' | 'normal' | 'large') => {
    setConfig(prev => ({ ...prev, fontSize: size }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up z-10">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-brand">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Preferências de Visualização
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size Control */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tamanho do Texto</label>
            <div className="grid grid-cols-3 gap-3 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
              <button
                onClick={() => handleFontSizeChange('small')}
                className={`py-2 rounded-md text-sm font-medium transition-all ${config.fontSize === 'small' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                Pequeno
              </button>
              <button
                onClick={() => handleFontSizeChange('normal')}
                className={`py-2 rounded-md text-base font-medium transition-all ${config.fontSize === 'normal' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                Normal
              </button>
              <button
                onClick={() => handleFontSizeChange('large')}
                className={`py-2 rounded-md text-lg font-medium transition-all ${config.fontSize === 'large' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                Grande
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Visualização</label>
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-white text-brand flex items-center justify-center text-xs font-bold flex-shrink-0">AI</div>
                   <div className="bg-white text-brand p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
                      <p className={`font-sans ${
                        config.fontSize === 'small' ? 'text-xs md:text-sm' : 
                        config.fontSize === 'large' ? 'text-base md:text-lg' : 
                        'text-sm md:text-base'
                      }`}>
                        Este é um exemplo de como o texto aparecerá no chat. A ArchTools ajusta a interface para o seu conforto visual.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-brand hover:bg-brand-light text-white rounded-lg font-bold text-sm transition-colors shadow-lg"
          >
            Concluir Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;