import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  photo_url: string;
  photo_type: 'before' | 'after';
}

interface PhotoViewerProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function PhotoViewer({ photos, isOpen, onClose, initialIndex = 0 }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const currentPhoto = photos[currentIndex];

  if (!isOpen || photos.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <div className="relative">
          {/* Заголовок */}
          <div className="absolute top-0 left-0 right-0 bg-black/50 text-white p-4 z-10 flex justify-between items-center">
            <div>
              <span className="text-sm">
                {currentPhoto?.photo_type === 'before' ? 'Фото до' : 'Фото после'} 
                ({currentIndex + 1} из {photos.length})
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Основное изображение */}
          <div className="flex items-center justify-center bg-black min-h-[60vh]">
            <img 
              src={currentPhoto?.photo_url} 
              alt={`Фото ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>

          {/* Навигация */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Миниатюры */}
          {photos.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 rounded border-2 ${
                      index === currentIndex ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={photo.photo_url} 
                      alt={`Миниатюра ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}