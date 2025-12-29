import React from 'react';
import { Terminal, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { MOCK_USERS } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <div className="relative bg-[#131314] border border-[#444746] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center animate-fadeIn">
        
        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 mb-6">
          <Terminal className="w-6 h-6 text-indigo-500" />
        </div>

        <h2 className="text-2xl font-normal text-white mb-2">Welcome to VibeCoder</h2>
        <p className="text-[#9aa0a6] mb-8 text-sm">
          Sign in to access your workspace and manage your quotas.
        </p>

        {/* Mock Google Button */}
        <button 
          onClick={() => onLogin(MOCK_USERS[0])}
          className="w-full flex items-center justify-center gap-3 bg-[#ffffff] hover:bg-[#f8f9fa] text-[#1f1f1f] px-4 py-2.5 rounded-full font-medium transition-colors mb-3 relative overflow-hidden group"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          <span>Sign in with Google</span>
          {/* Ripple effect hint */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <div className="mt-4 pt-4 border-t border-[#444746] w-full">
            <p className="text-[10px] text-[#9aa0a6] mb-2 uppercase tracking-widest font-bold">Dev Mode Login</p>
            <button 
              onClick={() => onLogin(MOCK_USERS[1])}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 w-full py-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />
              Login as Admin User
            </button>
        </div>
      </div>
    </div>
  );
};