import { Quota, User } from '../types';

const QUOTA_STORAGE_KEY = 'vibe_coder_quotas_v1';
const USER_STORAGE_KEY = 'vibe_coder_user_v1';

export const ADMIN_EMAIL = 'admin@google.com';

const DEFAULT_QUOTA: Quota = {
  maxTokens: 2_000_000,
  usedTokens: 0,
  cost: 0,
  resetPeriodHours: 24,
  lastResetTime: Date.now()
};

// Mock Users for simulation
export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'demo.user@gmail.com',
    name: 'Demo User',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff'
  },
  {
    id: '2',
    email: 'admin@google.com',
    name: 'Admin User',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=fff'
  }
];

export const storageService = {
  // --- Auth Management ---
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: (user: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    // Initialize quota if not exists
    storageService.getUserQuota(user.email); 
  },

  logout: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // --- Quota Management ---
  getUserQuota: (email: string): Quota => {
    const allQuotas = JSON.parse(localStorage.getItem(QUOTA_STORAGE_KEY) || '{}');
    // Ensure we return a valid object merged with defaults for missing fields
    const stored = allQuotas[email];
    const userQuota = stored ? { ...DEFAULT_QUOTA, ...stored } : { ...DEFAULT_QUOTA, lastResetTime: Date.now() };
    
    // Check for Time-based Reset
    const now = Date.now();
    const resetDurationMs = userQuota.resetPeriodHours * 60 * 60 * 1000;
    
    if (now - userQuota.lastResetTime > resetDurationMs) {
      console.log(`[Quota] Resetting quota for ${email}`);
      const resetQuota = {
        ...userQuota,
        usedTokens: 0,
        lastResetTime: now
      };
      storageService.saveUserQuota(email, resetQuota);
      return resetQuota;
    }

    return userQuota;
  },

  saveUserQuota: (email: string, newQuota: Quota) => {
    const allQuotas = JSON.parse(localStorage.getItem(QUOTA_STORAGE_KEY) || '{}');
    allQuotas[email] = newQuota;
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(allQuotas));
  },

  // Admin: Get all known emails with quotas
  getAllQuotas: (): Record<string, Quota> => {
    return JSON.parse(localStorage.getItem(QUOTA_STORAGE_KEY) || '{}');
  }
};