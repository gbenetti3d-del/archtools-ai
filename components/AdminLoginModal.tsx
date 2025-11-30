import React, { useState, useEffect, useRef } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setPassword('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '3685200') {
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-fade-in-up z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-700">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-white">Acesso Administrativo</h2>
          <p className="text-slate-500 text-sm mt-1">Digite a senha para configurar o sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full bg-slate-800 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand'} rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all text-center tracking-widest font-mono text-lg`}
              placeholder="•••••••"
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-xs text-center font-bold animate-pulse">Senha incorreta. Tente novamente.</p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand hover:bg-brand-light text-white rounded-lg font-bold transition-colors shadow-lg"
            >
              Acessar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;