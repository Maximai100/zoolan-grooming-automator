import { useState, useCallback } from 'react';
import type { FormState } from '@/types/common';

export function useFormState<T extends Record<string, any>>(
  initialData: T,
  validationRules?: Partial<Record<keyof T, (value: T[keyof T]) => string | null>>
) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isDirty: false
  });

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value };
      const newErrors = { ...prev.errors };
      
      // Валидация поля
      if (validationRules?.[field]) {
        const error = validationRules[field]!(value);
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
      }

      return {
        ...prev,
        data: newData,
        errors: newErrors,
        isDirty: true
      };
    });
  }, [validationRules]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return { ...prev, errors: newErrors };
    });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const reset = useCallback((newData?: T) => {
    setFormState({
      data: newData || initialData,
      errors: {},
      isSubmitting: false,
      isDirty: false
    });
  }, [initialData]);

  const validate = useCallback((): boolean => {
    if (!validationRules) return true;

    const errors: Partial<Record<keyof T, string>> = {};
    
    Object.entries(validationRules).forEach(([field, validator]) => {
      const error = validator(formState.data[field as keyof T]);
      if (error) {
        errors[field as keyof T] = error;
      }
    });

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [formState.data, validationRules]);

  return {
    ...formState,
    updateField,
    setFieldError,
    clearFieldError,
    setSubmitting,
    reset,
    validate,
    isValid: Object.keys(formState.errors).length === 0
  };
}