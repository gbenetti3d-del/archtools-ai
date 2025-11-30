import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  companyName: string;
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ companyName, onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Initial Reveal
    const t1 = setTimeout(() => setStage(1), 500);
    // Stage 2: Line drawing
    const t2 = setTimeout(() => setStage(2), 1200);
    // Stage 3: Subtitle (Delayed for effect)
    const t3 = setTimeout(() => setStage(3), 2600);
    // Stage 4: Exit (Extended to allow reading)
    const t4 = setTimeout(() => {
        onComplete();
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-brand flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse"></div>
      
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo Icon Animation */}
        <div className={`transition-all duration-1000 transform ${stage >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
            <div className="w-24 h-24 mb-6 relative">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-full h-full text-white overflow-visible">
                    {/* pathLength='1' enables the dasharray animation from 0 to 1 regardless of pixel length */}
                    <path 
                      pathLength="1"
                      className="animate-draw-stroke"
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" 
                    />
                </svg>
                {/* Glowing Effect */}
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse opacity-50"></div>
            </div>
        </div>

        {/* Text Container */}
        <div className="relative overflow-hidden p-2">
            <h1 className={`font-display font-bold text-5xl md:text-6xl text-white tracking-tight transition-all duration-1000 ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                {companyName.toUpperCase()}
            </h1>
            
            {/* The Drawing Line */}
            <div className={`h-0.5 bg-white mt-2 transition-all duration-1000 ease-out ${stage >= 2 ? 'w-full' : 'w-0'}`}></div>
        </div>

        {/* Subtitle - Smoother and Delayed */}
        <div className={`mt-5 font-sans text-blue-200 tracking-[0.3em] text-sm uppercase font-semibold transition-all duration-[2000ms] ease-out ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            SOLUÇÕES TECNOLÓGICAS
        </div>

      </div>

      {/* Decorative Technical Elements */}
      <div className="absolute bottom-10 right-10 flex gap-2">
         <div className={`w-2 h-2 bg-white/40 rounded-full transition-all delay-100 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>
         <div className={`w-2 h-2 bg-white/40 rounded-full transition-all delay-200 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>
         <div className={`w-2 h-2 bg-white/40 rounded-full transition-all delay-300 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
      
       <div className={`absolute top-10 left-10 font-mono text-[10px] text-white/30 transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
         LOADING MODULES...<br/>
         INITIATING AI CORE...<br/>
         ESTABLISHING SECURE CONNECTION...
      </div>

    </div>
  );
};

export default IntroAnimation;