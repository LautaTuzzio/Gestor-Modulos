import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, UserResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Development mode - set to true to enable example users
const IS_DEVELOPMENT = true;

// Example users for development
const EXAMPLE_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    dni: '12345678',
    role: 'admin' as const,
  },
  teacher: {
    email: 'teacher@example.com',
    password: 'teacher123',
    firstName: 'John',
    lastName: 'Doe',
    dni: '87654321',
    role: 'teacher' as const,
  },
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'teacher' | null;
  loading: boolean;
  isDevMode: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsExampleUser: (role: 'admin' | 'teacher') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode] = useState(IS_DEVELOPMENT);

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

  // Auto sign-in for development
  useEffect(() => {
    const autoSignIn = async () => {
      if (!IS_DEVELOPMENT) {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
        setLoading(false);
        return;
      }

      // In development mode, try to sign in with example admin user
      try {
        await signInAsExampleUser('admin');
      } catch (error) {
        console.error('Auto sign-in failed:', error);
        setLoading(false);
      }
    };

    autoSignIn();

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

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signInAsExampleUser = async (userRole: 'admin' | 'teacher') => {
    if (!IS_DEVELOPMENT) return;

    const exampleUser = EXAMPLE_USERS[userRole];
    
    // Create a mock session for development
    const mockSession: Session = {
      access_token: 'dev_token_' + Math.random().toString(36).substr(2, 9),
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'dev_refresh_' + Math.random().toString(36).substr(2, 9),
      user: {
        id: 'dev_' + userRole + '_' + Math.random().toString(36).substr(2, 9),
        app_metadata: { provider: 'email' },
        user_metadata: {
          email: exampleUser.email,
          full_name: `${exampleUser.firstName} ${exampleUser.lastName}`,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any,
    };

    setSession(mockSession);
    setUser(mockSession.user);
    setRole(exampleUser.role);
    setLoading(false);
    
    return mockSession;
  };

  const signIn = async (identifier: string, password: string) => {
    // In development mode, check against example users first
    if (IS_DEVELOPMENT) {
      const exampleUser = Object.values(EXAMPLE_USERS).find(
        user => (user.email === identifier || user.dni === identifier) && user.password === password
      );

      if (exampleUser) {
        await signInAsExampleUser(exampleUser.role);
        return;
      }
    }

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
    isDevMode,
    signIn,
    signOut,
    signInAsExampleUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
