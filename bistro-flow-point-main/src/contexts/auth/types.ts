
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Define user roles
export type UserRole = 'owner' | 'warehouse_admin' | 'cashier';

// Define user type
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean; // New property to track if auth has been fully initialized
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthorized: (allowedRoles: UserRole[]) => boolean;
}
