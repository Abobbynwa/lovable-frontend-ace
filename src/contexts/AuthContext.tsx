import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Teacher {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
}

type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  teacher: Teacher | null;
  userRoles: UserRole[];
  loading: boolean;
  hasRole: (role: UserRole) => boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch teacher profile and roles
          const [profileResult, rolesResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
          ]);
          
          if (profileResult.data) {
            setTeacher({
              id: profileResult.data.id,
              name: profileResult.data.name,
              email: profileResult.data.email,
              email_verified: profileResult.data.email_verified || false,
            });
          }

          if (rolesResult.data) {
            setUserRoles(rolesResult.data.map(r => r.role as UserRole));
          }
        } else {
          setTeacher(null);
          setUserRoles([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single(),
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
        ]).then(([profileResult, rolesResult]) => {
          if (profileResult.data) {
            setTeacher({
              id: profileResult.data.id,
              name: profileResult.data.name,
              email: profileResult.data.email,
              email_verified: profileResult.data.email_verified || false,
            });
          }

          if (rolesResult.data) {
            setUserRoles(rolesResult.data.map(r => r.role as UserRole));
          }

          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setTeacher(null);
    setUserRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        teacher,
        userRoles,
        loading,
        hasRole,
        signUp,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
