import React, { useState, useEffect } from 'react';
import {
  Button,
  Preloader
} from 'konsta/react';
import { api } from 'wasp/client/api';
import { Check, AlertTriangle } from 'lucide-react';

interface MarkAsCompleteButtonProps {
  lessonId: string;
  courseId: string;
  isAlreadyCompleted?: boolean;
  onComplete?: () => void;
  className?: string;
}

export default function MarkAsCompleteButton({
  lessonId,
  courseId,
  isAlreadyCompleted = false,
  onComplete,
  className = ''
}: MarkAsCompleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);

  // Se lo stato di completamento cambia esternamente, aggiorna lo stato interno
  useEffect(() => {
    setIsCompleted(isAlreadyCompleted);
  }, [isAlreadyCompleted]);

  const markLessonAsComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Chiamata all'API per aggiornare il progresso dell'utente
      const response = await api.post(`/api/lesson/${lessonId}/complete`, {
        lessonId,
        courseId,
        completed: true
      });

      setIsCompleted(true);
      
      // Chiamare il callback se fornito
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Errore durante il salvataggio del progresso:', err);
      setError(err instanceof Error ? err.message : 'Si è verificato un errore durante il salvataggio del progresso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`lesson-complete-button ${className}`}>
      {isCompleted ? (
        <Button 
          className="bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 px-5"
          disabled
        >
          <Check className="w-5 h-5" />
          <span>Completata</span>
        </Button>
      ) : (
        <Button
          onClick={markLessonAsComplete}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 px-5"
          disabled={isLoading}
        >
          {isLoading ? (
            <Preloader className="text-white" />
          ) : (
            <span>Segna come completata</span>
          )}
        </Button>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}