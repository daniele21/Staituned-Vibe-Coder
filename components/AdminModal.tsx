import React, { useState, useEffect } from 'react';
import { Shield, Save, X, Activity, Coins, BarChart, Clock, LogOut, Users, Lock, ChevronDown } from 'lucide-react';
import { Quota, User } from '../types';
import { storageService, ADMIN_EMAIL } from '../services/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
  // Callback to refresh the App's local quota state if the current user was modified
  onQuotaRefresh: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onLogout,
  onQuotaRefresh
}) => {
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [quotaData, setQuotaData] = useState<Quota | null>(null);
  
  // Form State
  const [limit, setLimit] = useState(0);
  const [resetHours, setResetHours] = useState(24);
  const [allEmails, setAllEmails] = useState<string[]>([]);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  // Initialize Data when Modal Opens
  useEffect(() => {
    if (isOpen && currentUser) {
      // Admin: Load list of users, default to self
      if (isAdmin) {
        const quotas = storageService.getAllQuotas();
        const emails = Object.keys(quotas);
        // Ensure current user is in the list even if not in quota storage yet
        if (!emails.includes(currentUser.email)) emails.push(currentUser.email);
        setAllEmails(emails);
      }
      
      // Default selection to current user if no target selected yet
      if (!targetEmail) {
        setTargetEmail(currentUser.email);
      }
    }
  }, [isOpen, currentUser, isAdmin]);

  // Load Quota when Target Email changes
  useEffect(() => {
    if (targetEmail) {
      const q = storageService.getUserQuota(targetEmail);
      setQuotaData(q);
      setLimit(q.maxTokens);
      setResetHours(q.resetPeriodHours);
    }
  }, [targetEmail, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = () => {
    if (!quotaData) return;

    const newQuota: Quota = {
      ...quotaData,
      maxTokens: Number(limit),
      resetPeriodHours: Number(resetHours)
    };

    storageService.saveUserQuota(targetEmail, newQuota);
    
    // If we edited the logged-in user, refresh the app state
    if (targetEmail === currentUser.email) {
      onQuotaRefresh();
    }
    
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const percentage = quotaData ? Math.min(100, (quotaData.usedTokens / quotaData.maxTokens) * 100) : 0;
  
  // Format Helpers
  const formatTokens = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(amount);
  };

  const nextResetDate = quotaData ? new Date(quotaData.lastResetTime + (quotaData.resetPeriodHours * 60 * 60 * 1000)) : new Date();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-100 font-bold">
            {isAdmin ? (
              <>
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>Admin Console</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5 text-indigo-500" />
                <span>Profile & Usage</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* User Profile / Selector */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-600" />
                   <div>
                     <div className="text-sm font-bold text-white flex items-center gap-2">
                        {currentUser.name}
                        {isAdmin && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
                     </div>
                     <div className="text-xs text-slate-400">{currentUser.email}</div>
                   </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-3 h-3" /> Logout
                </button>
             </div>

             {/* Admin: User Selector */}
             {isAdmin && (
               <div className="pt-4 border-t border-slate-700">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Manage User Quota
                  </label>
                  <div className="relative">
                    <select
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      className="w-full appearance-none bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {allEmails.map(email => (
                        <option key={email} value={email}>{email}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
               </div>
             )}
          </div>

          {/* Stats Display (For Selected User) */}
          {quotaData && (
            <>
              {/* Usage Bar */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <BarChart className="w-3 h-3" /> 
                    {targetEmail === currentUser.email ? 'My Token Usage' : `Usage: ${targetEmail}`}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {formatTokens(quotaData.usedTokens)} / {formatTokens(quotaData.maxTokens)}
                  </span>
                </div>
                
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                      <Coins className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Cost</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-slate-200">
                    {formatCurrency(quotaData.cost)}
                  </div>
                </div>
                
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reset</span>
                  </div>
                  <div className="text-xs font-medium text-slate-300 mt-1">
                    {nextResetDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Every {quotaData.resetPeriodHours}h
                  </p>
                </div>
              </div>

              {/* Settings Controls (Admin Only) */}
              <div className="space-y-4 pt-2">
                 <div className="flex items-center gap-2 mb-2">
                   {isAdmin ? (
                     <Shield className="w-4 h-4 text-emerald-500" />
                   ) : (
                     <Lock className="w-4 h-4 text-slate-600" />
                   )}
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                     {isAdmin ? 'Quota Configuration' : 'Quota Settings (Locked)'}
                   </span>
                 </div>

                 {/* Inputs */}
                 <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Token Limit</label>
                      <input 
                        type="number" 
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        disabled={!isAdmin}
                        className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 ${!isAdmin && 'opacity-50 cursor-not-allowed'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Reset Period (Hours)</label>
                      <input 
                        type="number" 
                        value={resetHours}
                        onChange={(e) => setResetHours(Number(e.target.value))}
                        disabled={!isAdmin}
                         className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 ${!isAdmin && 'opacity-50 cursor-not-allowed'}`}
                      />
                    </div>
                 </div>
                 
                 {!isAdmin && (
                   <p className="text-xs text-slate-600 italic text-center pt-2">
                     Contact an administrator to request a quota increase.
                   </p>
                 )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
          {isAdmin && (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/10"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};