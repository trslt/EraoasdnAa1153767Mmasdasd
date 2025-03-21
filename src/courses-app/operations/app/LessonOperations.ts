
'use server';

import { HttpError } from 'wasp/server';
import { GetLessonProgress } from 'wasp/server/operations';
/**
 * Ottiene lo stato di progresso di uno studente per una specifica lezione
 * 
 * @param lessonId - ID della lezione
 * @param courseId - ID del corso
 * @param userId - ID dell'utente (opzionale, utilizza l'utente corrente se non specificato)
 * @returns Oggetto con le informazioni sul progresso
 */

type GetLessonProgressGetArgs = {
    lessonId: string;
    courseId: string;
    userId?: string; // opzionale, usa utente corrente se non fornito
};

type GetLessonProgressResult = {
    completed: boolean;
    completedAt: Date | null;
    lastAccessed: Date;
    timeSpent: number;
    // Aggiungi qui altre proprietà se necessario
};

export const getLessonProgress: GetLessonProgress<GetLessonProgressGetArgs, GetLessonProgressResult | null> = async (args, context) => {
    if (!context.user) {
        throw new HttpError(401, 'Non autorizzato');
    }

    const userId = args.userId || context.user.id;
    const { lessonId, courseId } = args;

    // Se l'utente richiede informazioni su un altro utente e non è admin
    if (userId !== context.user.id && !context.user.isAdmin) {
        throw new HttpError(403, 'Non autorizzato a visualizzare il progresso di altri utenti');
    }

    try {
        // Verifica che l'utente sia iscritto al corso
        const enrollment = await context.entities.CourseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return null; // L'utente non è iscritto al corso
        }

        // Cerca il progresso per questa lezione
        const progress = await context.entities.StudentProgress.findUnique({
            where: {
                userId_courseId_lessonId: {
                    userId,
                    courseId,
                    lessonId
                }
            },
            select: {
                completed: true,
                completedAt: true,
                lastAccessed: true,
                timeSpent: true
            }
        });

        return progress;
    } catch (error) {
        console.error('Errore nel recupero del progresso dello studente:', error);
        throw new HttpError(500, 'Errore interno del server');
    }
};