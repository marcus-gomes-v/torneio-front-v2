import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { auth } from '../../lib/firebase';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string | null) => void;
  error?: string;
  helpText?: string;
  className?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  error,
  helpText,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
      alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Get token from Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const token = await currentUser.getIdToken();
      console.log('Token obtained from Firebase');

      const response = await fetch('http://localhost:3001/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm/6 font-medium text-white">
        {label}
      </label>
      <div className="mt-2">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-full object-cover rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-gray-900/75 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-sm text-white">Fazendo upload...</p>
                </div>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div
            className={`flex justify-center rounded-lg border border-dashed ${
              error ? 'border-red-500' : 'border-white/25'
            } px-6 py-10 ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-white/50'} transition-colors`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="text-center">
              {uploading ? (
                <>
                  <div className="mx-auto inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  <div className="mt-4 text-sm/6 text-gray-400">
                    <span className="font-semibold text-indigo-400">Fazendo upload...</span>
                  </div>
                  <p className="text-xs/5 text-gray-400">Aguarde enquanto enviamos sua imagem</p>
                </>
              ) : (
                <>
                  <PhotoIcon
                    aria-hidden="true"
                    className="mx-auto h-12 w-12 text-gray-500"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-400">
                    <span className="relative cursor-pointer rounded-md font-semibold text-indigo-400 hover:text-indigo-300">
                      Selecione uma imagem
                    </span>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs/5 text-gray-400">PNG, JPG, GIF, WEBP até 5MB</p>
                </>
              )}
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="sr-only"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
