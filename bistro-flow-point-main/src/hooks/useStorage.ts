import { useState } from 'react';
import { uploadFile, deleteFile, listFiles } from '@/integrations/supabase/storage';

export const useStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Upload a file to Supabase Storage
   */
  const upload = async (file: File, path?: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = await uploadFile(file, path);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Delete a file from Supabase Storage
   */
  const remove = async (filePath: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await deleteFile(filePath);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * List files in a specific path
   */
  const list = async (path: string = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await listFiles(path);
      return files;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    upload,
    remove,
    list,
    isLoading,
    error
  };
};