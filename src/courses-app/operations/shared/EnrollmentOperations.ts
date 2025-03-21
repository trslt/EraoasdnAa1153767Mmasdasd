import {
    IsUserEnrolledInCourse
  } from 'wasp/server/operations';
  import { HttpError } from 'wasp/server';
  
  /**
   * Verifica se un utente è iscritto a un corso specifico
   *
   * @param args.courseId - ID del corso da verificare
   * @param args.userId - ID dell'utente (opzionale, utilizza l'utente attuale se non specificato)
   * @returns Un oggetto con informazioni sull'iscrizione e lo stato del progresso
   */
  
  type IsEnrolledArgs = { 
    courseId: string;
    userId?: string; // opzionale, usa utente corrente se non fornito
  };
  
  type IsEnrolledResult = { 
    isEnrolled: boolean;
    enrollment?: {
      id: string;
      enrolledAt: Date;
      progressPercentage: number;
      currentLessonId?: string | null;
      lastCompletedId?: string | null;
    };
  };
  
  export const isUserEnrolledInCourse: IsUserEnrolledInCourse<IsEnrolledArgs, IsEnrolledResult> = async (args, context) => {

    if (!context.user) {
      throw new HttpError(401, 'Non autorizzato');
    }
  
    const userId = args.userId || context.user.id;
    const { courseId } = args;
  
    // Se l'utente richiede informazioni su un altro utente e non è admin
    if (userId !== context.user.id && !context.user.isAdmin) {
      throw new HttpError(403, 'Non autorizzato a visualizzare le iscrizioni di altri utenti');
    }
  
    try {
      // Cerca l'iscrizione al corso
      const enrollment = await context.entities.CourseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        select: {
          id: true,
          enrolledAt: true,
          progressPercentage: true,
          currentLessonId: true,
          lastCompletedId: true
        }
      });
  
      if (!enrollment) {
        return { 
          isEnrolled: false 
        };
      }
  
      return {
        isEnrolled: true,
        enrollment
      };
    } catch (error) {
      console.error('Errore nel verificare l\'iscrizione al corso:', error);
      throw new HttpError(500, 'Errore interno del server');
    }
  };
  