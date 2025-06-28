import React, { useState, ChangeEvent } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  folder?: string;
  accept?: string;
}

export function FileUpload({ onUploadComplete, folder = '', accept = 'image/*' }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { upload, isLoading, error } = useStorage();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const url = await upload(file, folder);
    if (url && onUploadComplete) {
      onUploadComplete(url);
      // Reset after successful upload
      setFile(null);
      setPreview(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input 
          type="file" 
          onChange={handleFileChange} 
          accept={accept}
          disabled={isLoading}
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-xs max-h-48 object-contain border rounded-md"
          />
        </div>
      )}
    </div>
  );
}