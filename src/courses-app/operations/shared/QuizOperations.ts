import { Prisma } from '@prisma/client';
import {
    GetQuiz,
    GetLessonQuizzes,
    GetQuizList,
    GetUserQuizAttempts,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';

/**
 * Ottiene tutti i quiz con paginazione e filtri opzionali
 * 
 * @param page  Pagina da recuperare
 * @param limit Numero di elementi per pagina
 * @param search Testo da cercare nei titoli e descrizioni dei quiz
 * @param isActive Filtra i quiz attivi o inattivi
 */

type QuizListBody = {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

export const getQuizList: GetQuizList<QuizListBody, any> = async (args, context) => {

    // Verifica che l'utente sia autenticato e sia admin
    if (!context.user) {
        throw new HttpError(401, 'Non autorizzato');
    }

    if (!context.user.isAdmin) {
        throw new HttpError(403, 'Accesso negato');
    }

    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    // Costruisci il filtro di ricerca
    const where: Prisma.QuizWhereInput = {};

    if (args.search) {
        where.translations = {
            some: {
                OR: [
                    { title: { contains: args.search, mode: 'insensitive' } },
                    { description: { contains: args.search, mode: 'insensitive' } }
                ]
            }
        };
    }

    if (args.isActive !== undefined) {
        where.isActive = args.isActive;
    }

    try {
        // Recupera il conteggio totale per la paginazione
        const total = await context.entities.Quiz.count({ where });

        // Recupera i quiz con le loro traduzioni
        const quizzes = await context.entities.Quiz.findMany({
            where,
            include: {
                translations: true,
                _count: {
                    select: {
                        quizQuestions: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return {
            quizzes,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Errore nel recupero dei quiz:', error);
        throw new HttpError(500, 'Errore interno del server');
    }
};

/**
 * Ottiene un quiz specifico con tutte le sue domande e opzioni
 * 
 * @param quizId ID del quiz da recuperare
 */

export const getQuiz: GetQuiz<{ quizId: string }, any> = async (args, context) => {
    
    // Verifica che l'utente sia autenticato
    if (!context.user) {
        throw new HttpError(401, 'Non autorizzato');
    }

    // Gli utenti normali possono visualizzare i quiz, ma solo quelli attivi
    // Gli admin possono visualizzare tutti i quiz
    const { quizId } = args;

    try {
        // Costruisci il filtro in base al ruolo dell'utente
        const where: Prisma.QuizWhereInput = { id: quizId };
        if (!context.user.isAdmin) {
            where.isActive = true;
        }

        // Recupera il quiz completo
        const quiz = await context.entities.Quiz.findFirst({
            where,
            include: {
                translations: true,
                quizQuestions: {
                    include: {
                        question: {
                            include: {
                                translations: true,
                                options: {
                                    include: {
                                        translations: true
                                    },
                                    orderBy: {
                                        position: 'asc'
                                    }
                                },
                                skills: {
                                    include: {
                                        skill: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        });

        if (!quiz) {
            throw new HttpError(404, 'Quiz non trovato');
        }

        return quiz;
    } catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }
        console.error('Errore nel recupero del quiz:', error);
        throw new HttpError(500, 'Errore interno del server');
    }
};

/**
 * Ottiene tutti i quiz associati a una lezione
 * 
 * @param lessonId ID della lezione
 */
export const getLessonQuizzes: GetLessonQuizzes<{ lessonId: string }, any> = async (args, context) => {
    // Verifica che l'utente sia autenticato
    if (!context.user) {
        throw new HttpError(401, 'Non autorizzato');
    }

    const { lessonId } = args;

    try {
        // Recupera la lezione per verificare che esista
        const lesson = await context.entities.Lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) {
            throw new HttpError(404, 'Lezione non trovata');
        }

        // Costruisci il filtro in base al ruolo dell'utente
        const where: Prisma.LessonQuizWhereInput = { lessonId };
        if (!context.user.isAdmin) {
            where.quiz = { isActive: true };
        }

        // Recupera tutti i quiz associati alla lezione
        const lessonQuizzes = await context.entities.LessonQuiz.findMany({
            where,
            include: {
                quiz: {
                    include: {
                        translations: true,
                        _count: {
                            select: {
                                quizQuestions: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                position: 'asc'
            }
        });

        return lessonQuizzes;
    } catch (error) {
        console.error('Errore nel recupero dei quiz della lezione:', error);
        throw new HttpError(500, 'Errore interno del server');
    }
};

/**
 * Ottiene i risultati dei tentativi dell'utente per un quiz specifico
 * 
 * @param quizId ID del quiz
 * @param lessonId ID della lezione (opzionale)
 */
export const getUserQuizAttempts: GetUserQuizAttempts<{
    quizId: string,
    lessonId?: string
}, any> = async (args, context) => {
    // Verifica che l'utente sia autenticato
    if (!context.user) {
        throw new HttpError(401, 'Non autorizzato');
    }

    const { quizId, lessonId } = args;
    const userId = context.user.id;

    try {
        // Costruisci il filtro per i tentativi dell'utente
        const where: Prisma.UserQuizAttemptWhereInput = {
            quizId,
            userId
        };

        if (lessonId) {
            where.lessonId = lessonId;
        }

        // Recupera tutti i tentativi dell'utente per questo quiz
        const attempts = await context.entities.UserQuizAttempt.findMany({
            where,
            include: {
                answers: {
                    include: {
                        question: {
                            include: {
                                translations: true
                            }
                        },
                        selectedOption: {
                            include: {
                                translations: true
                            }
                        }
                    }
                },
                lessonQuiz: true
            },
            orderBy: {
                startedAt: 'desc'
            }
        });

        // Conta i tentativi e calcola le statistiche di successo
        const totalAttempts = attempts.length;
        const successfulAttempts = attempts.filter(attempt => attempt.isPassed).length;
        const averageScore = attempts.length > 0
            ? attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length
            : 0;

        return {
            attempts,
            stats: {
                totalAttempts,
                successfulAttempts,
                averageScore
            }
        };
    } catch (error) {
        console.error('Errore nel recupero dei tentativi del quiz:', error);
        throw new HttpError(500, 'Errore interno del server');
    }
};