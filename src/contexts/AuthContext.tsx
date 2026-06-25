import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchProfile, signIn, signOut } from '../services/auth';
import type { UserRole, Profile } from '../services/auth';
import { hydrateCompanySettingsCache, settingsOwnerId } from '../services/companySettings';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  isVerified: boolean;
  ownerId: string | null;
  agencyTier?: 'start' | 'pro' | 'scale' | null;
  agencyPartnerLimit?: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOwner: boolean;
  isEmployee: boolean;
  isSuperEmployee: boolean;
  isSalesAgency: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function buildUser(session: Session): Promise<AuthUser | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const profile: Profile = await fetchProfile(session.user.id);
      return {
        id: session.user.id,
        email: session.user.email!,
        role: profile.role,
        fullName: profile.full_name,
        isVerified: profile.is_verified,
        ownerId: profile.owner_id,
        agencyTier: profile.agency_tier ?? null,
        agencyPartnerLimit: profile.agency_partner_limit ?? null,
      };
    } catch {
      if (attempt === 0) await new Promise(r => setTimeout(r, 500));
    }
  }
  const meta = session.user.user_metadata as { role?: UserRole; full_name?: string } | undefined;
  if (meta?.role) {
    return {
      id: session.user.id,
      email: session.user.email!,
      role: meta.role,
      fullName: meta.full_name ?? session.user.email!,
      isVerified: false,
      ownerId: null,
      agencyTier: null,
      agencyPartnerLimit: null,
    };
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setzt den User und hydratisiert den Company-Settings-Cache aus der DB (WL2).
  const applyUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) void hydrateCompanySettingsCache(settingsOwnerId(u));
  };

  useEffect(() => {
    // Prüfe initialen Session-Status
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        applyUser(await buildUser(session));
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
          return;
        }
        if (session) {
          applyUser(await buildUser(session));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const session = await signIn(email, password);
    applyUser(await buildUser(session));
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isLoading,
      isOwner: user?.role === 'owner',
      isEmployee: user ? ['installer', 'vertrieb', 'projektleiter', 'monteur', 'backoffice', 'super_employee', 'sales_agency'].includes(user.role) : false,
      isSuperEmployee: user?.role === 'super_employee',
      isSalesAgency: user?.role === 'sales_agency',
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
