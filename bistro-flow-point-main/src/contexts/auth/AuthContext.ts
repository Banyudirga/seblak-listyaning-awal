
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
