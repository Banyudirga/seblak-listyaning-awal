import { supabase } from './client';

// Define bucket name - you'll need to create this bucket in your Supabase dashboard
const STORAGE_BUCKET = 'seblak-images';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param path - Optional path within the bucket
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (file: File, path?: string): Promise<string | null> => {
  try {
    // Create a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param filePath - The path of the file to delete
 * @returns Boolean indicating success
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL if it's a full URL
    const path = filePath.includes(STORAGE_BUCKET) 
      ? filePath.split(`${STORAGE_BUCKET}/`)[1] 
      : filePath;
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

/**
 * Get a list of files from a specific path in the bucket
 * @param path - The path to list files from
 * @returns Array of file objects
 */
export const listFiles = async (path: string = '') => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(path);
    
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in listFiles:', error);
    return [];
  }
};