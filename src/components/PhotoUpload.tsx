import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useAppointmentPhotos } from '@/hooks/useAppointmentPhotos';

interface PhotoUploadProps {
  appointmentId: string;
  photoType: 'before' | 'after';
  title: string;
  onPhotoUploaded?: () => void;
}

export default function PhotoUpload({ appointmentId, photoType, title, onPhotoUploaded }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploading, uploadPhoto, getPhotosByType, deletePhoto, loading } = useAppointmentPhotos(appointmentId);
  
  const photos = getPhotosByType(photoType);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    try {
      await uploadPhoto(file, appointmentId, photoType);
      onPhotoUploaded?.();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('Удалить эту фотографию?')) {
      await deletePhoto(photoId);
      onPhotoUploaded?.();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4" />
        <span className="font-medium text-sm">{title}</span>
      </div>

      {/* Загруженные фотографии */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img 
                src={photo.photo_url} 
                alt={`${title} ${photo.id}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Компактная кнопка загрузки */}
      <div
        className={`w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}