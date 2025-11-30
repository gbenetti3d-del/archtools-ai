import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  companyName: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, companyName }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden cursor-pointer group" onClick={onStart}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-brand/5 to-brand/10 pointer-events-none"></div>

      {/* Central Interactive Trigger */}
      <div className="relative z-10 flex flex-col items-center justify-center transition-transform duration-700 transform group-hover:scale-110">
        
        {/* Animated Logo Container */}
        <div className="w-32 h-32 md:w-40 md:h-40 bg-brand rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/30 animate-float border border-white/10 relative">
          {/* Glow Effect behind logo */}
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
          
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
          </svg>
        </div>

        {/* Text Call to Action */}
        <div className="mt-12 text-center space-y-3 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
           <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
             {companyName}
           </h1>
           <p className="font-sans text-blue-200 text-xs md:text-sm tracking-[0.2em] uppercase">
             Clique para iniciar a experiência
           </p>
        </div>
      </div>

    </div>
  );
};

export default StartScreen;