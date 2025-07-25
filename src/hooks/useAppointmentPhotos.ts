import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppointmentPhoto {
  id: string;
  appointment_id: string;
  photo_url: string;
  photo_type: 'before' | 'after';
  uploaded_at: string;
  created_at: string;
}

export function useAppointmentPhotos(appointmentId?: string) {
  const [photos, setPhotos] = useState<AppointmentPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Загружаем фотографии для конкретного визита
  const fetchPhotos = async () => {
    if (!appointmentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointment_photos')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('uploaded_at', { ascending: true });

      if (error) throw error;
      setPhotos((data || []) as AppointmentPhoto[]);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фотографии',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Загружаем файл в Storage и сохраняем запись в БД
  const uploadPhoto = async (file: File, appointmentId: string, photoType: 'before' | 'after') => {
    setUploading(true);
    try {
      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${appointmentId}/${photoType}/${Date.now()}.${fileExt}`;

      // Загружаем файл в Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(uploadData.path);

      // Сохраняем запись в БД
      const { data: photoData, error: dbError } = await supabase
        .from('appointment_photos')
        .insert({
          appointment_id: appointmentId,
          photo_url: urlData.publicUrl,
          photo_type: photoType
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Обновляем локальное состояние
      setPhotos(prev => [...prev, photoData as AppointmentPhoto]);
      
      toast({
        title: 'Успешно',
        description: 'Фотография загружена'
      });

      return photoData;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фотографию',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Удаляем фотографию
  const deletePhoto = async (photoId: string) => {
    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // Удаляем из Storage
      const path = photo.photo_url.split('/').pop();
      if (path) {
        await supabase.storage
          .from('pet-photos')
          .remove([path]);
      }

      // Удаляем из БД
      const { error } = await supabase
        .from('appointment_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // Обновляем локальное состояние
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      
      toast({
        title: 'Успешно',
        description: 'Фотография удалена'
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить фотографию',
        variant: 'destructive'
      });
    }
  };

  // Группируем фотографии по типу
  const getPhotosByType = (type: 'before' | 'after') => {
    return photos.filter(photo => photo.photo_type === type);
  };

  useEffect(() => {
    fetchPhotos();
  }, [appointmentId]);

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    getPhotosByType,
    refetch: fetchPhotos
  };
}