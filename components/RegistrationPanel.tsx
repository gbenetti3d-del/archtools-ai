import React, { useState } from 'react';
import { UserProfile } from '../types';

interface RegistrationPanelProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

type RegistrationStep = 'SELECTION' | 'FORM';

const RegistrationPanel: React.FC<RegistrationPanelProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<RegistrationStep>('SELECTION');
  const [clientType, setClientType] = useState<'new' | 'existing'>('existing');
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    company: '',
    project: '',
    clientType: 'existing',
    projectType: '',
    projectStage: '',
    additionalInfo: ''
  });

  const handleSelection = (type: 'new' | 'existing') => {
    setClientType(type);
    setProfile(prev => ({ ...prev, clientType: type }));
    setStep('FORM');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (profile.name && profile.company && profile.project) {
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step === 'FORM') {
      setStep('SELECTION');
    } else {
      // If we are at selection and back is pressed, we could go back to start screen
      // But the user requested to remove the specific "Back to Admin" button.
      onBack();
    }
  };

  // --- STEP 1: SELECTION SCREEN ---
  if (step === 'SELECTION') {
    return (
      <div className="max-w-4xl mx-auto mt-10 animate-fade-in p-6">
         <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-white mb-2">Bem-vindo à ArchTools</h2>
            <p className="text-slate-400">Selecione seu perfil para iniciarmos o atendimento.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option: New Client */}
            <button 
              onClick={() => handleSelection('new')}
              className="group relative bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand p-8 rounded-2xl text-left flex flex-col gap-4 shadow-xl hover:shadow-brand/20 transform transition-transform duration-300 hover:scale-[1.02]"
            >
               <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white mb-2">Novo Cliente / Lead</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">
                   Gostaria de conhecer as soluções, solicitar um orçamento ou desenvolver um novo projeto do zero.
                 </p>
               </div>
               <div className="mt-auto pt-4 flex items-center text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Iniciar Projeto <span className="ml-2">→</span>
               </div>
            </button>

            {/* Option: Existing Client */}
            <button 
              onClick={() => handleSelection('existing')}
              className="group relative bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-white/20 p-8 rounded-2xl text-left flex flex-col gap-4 shadow-xl hover:shadow-white/5 transform transition-transform duration-300 hover:scale-[1.02]"
            >
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-brand transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white mb-2">Já sou Cliente / Parceiro</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">
                   Tenho um projeto em andamento e preciso de suporte, ajustes ou novas demandas.
                 </p>
               </div>
                <div className="mt-auto pt-4 flex items-center text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Acessar Painel <span className="ml-2">→</span>
               </div>
            </button>
         </div>
      </div>
    );
  }

  // --- STEP 2: FORM SCREEN ---
  return (
    <div className="max-w-xl mx-auto mt-6 animate-fade-in p-4 md:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className={`p-6 text-center ${clientType === 'new' ? 'bg-brand' : 'bg-slate-800 border-b border-slate-700'}`}>
           <h2 className="font-display font-bold text-2xl text-white">
             {clientType === 'new' ? 'Novo Projeto' : 'Identificação'}
           </h2>
           <p className={`text-sm mt-1 ${clientType === 'new' ? 'text-blue-100' : 'text-slate-400'}`}>
             {clientType === 'new' 
               ? 'Conte-nos um pouco sobre o que você deseja construir.' 
               : 'Confirme seus dados para acessar o chat.'}
           </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Seu Nome</label>
              <input 
                type="text" 
                required
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none text-white font-sans"
                placeholder="Ex: Ana Silva"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Empresa / Construtora</label>
              <input 
                type="text" 
                required
                value={profile.company}
                onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none text-white font-sans"
                placeholder="Ex: Horizon Inc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">
              {clientType === 'new' ? 'Nome do Empreendimento (Provisório)' : 'Projeto Atual (Foco)'}
            </label>
            <input 
              type="text" 
              required
              value={profile.project}
              onChange={(e) => setProfile(prev => ({ ...prev, project: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none text-white font-sans"
              placeholder={clientType === 'new' ? "Ex: Edifício Future Tower" : "Ex: Residencial Vista Mar"}
            />
          </div>

          {/* EXTRA FIELDS FOR NEW CLIENTS */}
          {clientType === 'new' && (
            <div className="space-y-4 animate-fade-in pt-2 border-t border-slate-800 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Tipo de Projeto</label>
                    <input 
                      type="text" 
                      value={profile.projectType || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, projectType: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none text-white font-sans"
                      placeholder="Ex: Residencial, Comercial"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Estágio da Obra</label>
                    <input 
                      type="text" 
                      value={profile.projectStage || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, projectStage: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none text-white font-sans"
                      placeholder="Ex: Lançamento, Fundação"
                    />
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Breve Descrição / Necessidade</label>
                <textarea 
                  value={profile.additionalInfo || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none text-white font-sans h-24 resize-none"
                  placeholder="Descreva o que você precisa (ex: Renders internos, Tour Virtual...)"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between gap-4">
             <button 
                type="button"
                onClick={handleBack}
                className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors"
             >
               Voltar
             </button>
             <button 
                type="submit"
                className="flex-1 bg-brand hover:bg-brand-light text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-brand/40 transition-all transform hover:scale-[1.02]"
             >
               Iniciar Chat
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPanel;