import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<Profile | null>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string | null }) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data as Profile | null;
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (!user || !supabase) {
      setProfile(null);
      return;
    }
    const data = await fetchProfile(user.id);
    setProfile(data);
  }, [user, supabase, fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    // Safety net: never let the UI hang on the loading skeleton. If the session
    // request stalls (network / misconfig on prod), resolve loading anyway so
    // the public Login/Register buttons render.
    const failSafe = setTimeout(() => {
      if (active) setLoading(false);
    }, 4000);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const session = data.session;
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          if (active) setProfile(p);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("getSession failed", err);
      } finally {
        if (active) setLoading(false);
        clearTimeout(failSafe);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      try {
        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          if (active) setProfile(p);
        } else {
          setProfile(null);
        }
      } catch {
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add credentials to .env.local"
        );
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        const p = await fetchProfile(data.user.id);
        setProfile(p);
        setUser(data.user);
        return p;
      }
      return null;
    },
    [supabase, fetchProfile]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add credentials to .env.local"
        );
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("signOut failed", err);
    } finally {
      // Always clear local state so the UI never holds a stale session,
      // even if the network sign-out call fails.
      setUser(null);
      setProfile(null);
    }
  }, [supabase]);

  const updateProfile = useCallback(
    async (data: { full_name?: string; avatar_url?: string | null }) => {
      if (!supabase || !user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
    },
    [supabase, user, refreshProfile]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) throw new Error("Not authenticated");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    [supabase]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        configured: !!supabase,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
