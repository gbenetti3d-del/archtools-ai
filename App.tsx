import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import RegistrationPanel from './components/RegistrationPanel';
import ChatWindow from './components/ChatWindow';
import IntroAnimation from './components/IntroAnimation';
import SettingsModal from './components/SettingsModal';
import AdminLoginModal from './components/AdminLoginModal';
import ConfigurationPanel from './components/ConfigurationPanel'; // Re-imported
import { CompanyConfig, ViewState, UserProfile, UIConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { initializeChat, sendRegistrationNotification } from './services/geminiService';

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.START);
  const [config, setConfig] = useState<CompanyConfig>(DEFAULT_CONFIG);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // UI State
  const [uiConfig, setUiConfig] = useState<UIConfig>({ fontSize: 'normal' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const handleStartExperience = () => {
    setViewState(ViewState.SPLASH);
  };

  const handleIntroComplete = () => {
    setViewState(ViewState.REGISTER);
  };

  const handleRegistrationComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    
    // Dispara a notificação de sistema oculta para o admin
    sendRegistrationNotification(profile);
    
    initializeChat(config, profile);
    setViewState(ViewState.CHAT);
  };

  const handleBackToStart = () => {
    setViewState(ViewState.START);
    setUserProfile(null);
  };
  
  const handleAdminLoginSuccess = () => {
    setViewState(ViewState.CONFIG);
  };

  const openWebsite = () => {
      if (config.websiteUrl) {
          window.open(config.websiteUrl, '_blank');
      }
  };

  // Logic to determine if we should show the main navbar
  // Hide navbar on START, SPLASH and CONFIG screens
  const showNavbar = viewState !== ViewState.START && viewState !== ViewState.SPLASH && viewState !== ViewState.CONFIG;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-brand-light selection:text-white">
      
      {/* Start Screen (Interactive Logo) */}
      {viewState === ViewState.START && (
        <StartScreen 
          companyName={config.companyName}
          onStart={handleStartExperience}
        />
      )}

      {/* Intro Animation Overlay */}
      {viewState === ViewState.SPLASH && (
        <IntroAnimation 
          companyName={config.companyName} 
          onComplete={handleIntroComplete} 
        />
      )}
      
      {/* Admin Configuration Panel */}
      {viewState === ViewState.CONFIG && (
        <ConfigurationPanel
          config={config}
          setConfig={setConfig}
          onStartChat={handleBackToStart}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={uiConfig}
        setConfig={setUiConfig}
      />
      
      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Optimized Navigation / Brand Bar */}
      {showNavbar && (
      <nav className="w-full bg-slate-900/80 backdrop-blur-md border-b border-white/5 py-3 px-4 md:px-8 flex items-center justify-between shadow-2xl sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand/20 group-hover:animate-float transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-white leading-none">{config.companyName}</span>
          </div>
        </div>
        
        {/* Optimized Toolbar Actions */}
        <div className="flex items-center bg-slate-800/50 rounded-xl p-1 border border-white/5">
            {/* Admin Button */}
            <button 
                onClick={() => setIsAdminLoginOpen(true)}
                className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                title="Acesso Administrativo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
            </button>

            <div className="w-px h-4 bg-white/10 mx-1"></div>
            
            {/* Settings Button */}
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                title="Tamanho da Fonte"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
                </svg>
            </button>

            {/* Website Button */}
            {config.websiteUrl && (
                <button 
                    onClick={openWebsite}
                    className="ml-1 px-3 py-1.5 bg-brand hover:bg-brand-light text-white text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-brand/20"
                >
                    <span className="hidden sm:inline">Web</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                </button>
            )}
        </div>
      </nav>
      )}

      {/* Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto md:px-4">
        
        {viewState === ViewState.REGISTER && (
          <RegistrationPanel
            onComplete={handleRegistrationComplete}
            onBack={handleBackToStart}
          />
        )}

        {viewState === ViewState.CHAT && userProfile && (
          <ChatWindow 
            config={config}
            userProfile={userProfile}
            onBack={handleBackToStart}
            uiConfig={uiConfig}
          />
        )}
      </main>

    </div>
  );
}

export default App;