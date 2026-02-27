'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { uploadAvatarAction } from '@/actions/upload';

interface AvatarUploadProps {
  currentImage: string | null;
  username: string;
}

export default function AvatarUpload({ currentImage, username }: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(currentImage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append('file', compressed, file.name);
      const result = await uploadAvatarAction(formData);
      if (result.success) {
        setImageSrc(result.data.url);
      } else {
        setError(result.error ?? 'Upload failed');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initials = username ? username[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={handleClick}
        className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
        aria-label="Upload profile picture"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      >
        {imageSrc ? (
          <Image src={imageSrc} alt={username} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-fuchsia-600 text-white text-3xl font-bold select-none">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isLoading ? (
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          ) : (
            <Camera className="h-7 w-7 text-white" />
          )}
        </div>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs text-muted-foreground">Click to upload photo</p>
      {error && <p className="text-xs text-red-400 max-w-[200px] text-center">{error}</p>}
    </div>
  );
}
