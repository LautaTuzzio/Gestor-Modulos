import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'teacher' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setRole(data.role);
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setRole(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    // First try to sign in with the identifier as email
    let { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    // If login with email fails, try to find user by DNI
    if (error?.message.includes('Invalid login credentials')) {
      // Query the teachers table to find the email associated with the DNI
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('email')
        .eq('dni', identifier)
        .single();

      if (teacherError || !teacherData) {
        throw new Error('Credenciales inválidas. Verifique su correo electrónico/DNI y contraseña.');
      }

      // Get the email from the teacher data (using type assertion as a workaround)
      const teacherEmail = (teacherData as { email: string }).email;
      
      if (!teacherEmail) {
        throw new Error('No se encontró un correo electrónico asociado a este DNI.');
      }

      // Try to sign in with the found email
      const signInResponse = await supabase.auth.signInWithPassword({
        email: teacherEmail,
        password,
      });
      
      data = signInResponse.data;
      error = signInResponse.error;
    }

    if (error) throw error;

    if (data.user) {
      await fetchUserRole(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setRole(null);
  };

  const value = {
    user,
    session,
    role,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
