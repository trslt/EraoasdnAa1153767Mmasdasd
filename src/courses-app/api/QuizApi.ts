'use server';

import {
    AssociateLessonQuiz,
    AddQuestionToQuiz,
    RemoveQuestionFromQuiz
} from "wasp/server/api";
import { Quiz, LessonQuiz } from 'wasp/entities';
import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../services/UserServices';

const prisma = new PrismaClient();


/**
 * API Associa Quiz a Lezione
 */

interface LessonQuizBody {
    quizId: string;
    quizType: 'STANDARD' | 'PRACTICE';
    position: number;
    isRequired: boolean;
    canSkipLesson: boolean;
}

interface LessonQuizParams {
    lessonId: string;
}

export const associateLessonQuiz: AssociateLessonQuiz<{}, LessonQuiz> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { lessonId } = req.params as LessonQuizParams;
    const { quizId, quizType, position, isRequired, canSkipLesson } = req.body as LessonQuizBody;

    try {
        // Verifica che la lezione e il quiz esistano
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { activeVersion: true }
        });

        if (!lesson) {
            throw new HttpError(404, "Lezione non trovata");
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId }
        });

        if (!quiz) {
            throw new HttpError(404, "Quiz non trovato");
        }

        // Crea l'associazione lezione-quiz
        const lessonQuiz = await prisma.lessonQuiz.create({
            data: {
                lessonId,
                quizId,
                quizType,
                position,
                isRequired,
                canSkipLesson,
                lessonVersionId: lesson.activeVersionId // Usa la versione attiva della lezione
            }
        });

        return res.json(lessonQuiz);
    } catch (error) {
        console.error("Errore nell'associazione del quiz alla lezione:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};

/**
 * API Aggiungi Domanda a Quiz
 */

interface AddQuestionToQuizParams {
    quizId: string;
}

interface AddQuestionToQuizBody {
    questionId: string;
    position: number;
}

export const addQuestionToQuiz: AddQuestionToQuiz<{}, {}> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { quizId } = req.params as AddQuestionToQuizParams;
    const { questionId, position } = req.body as AddQuestionToQuizBody;

    try {
        // Verifica che il quiz e la domanda esistano
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId }
        });

        if (!quiz) {
            throw new HttpError(404, "Quiz non trovato");
        }

        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!question) {
            throw new HttpError(404, "Domanda non trovata");
        }

        // Verifica se la domanda è già nel quiz
        const existingQuizQuestion = await prisma.quizQuestion.findUnique({
            where: {
                quizId_questionId: {
                    quizId,
                    questionId
                }
            }
        });

        if (existingQuizQuestion) {
            // Aggiorna solo la posizione
            await prisma.quizQuestion.update({
                where: {
                    quizId_questionId: {
                        quizId,
                        questionId
                    }
                },
                data: { position }
            });
        } else {
            // Crea una nuova associazione
            await prisma.quizQuestion.create({
                data: {
                    quizId,
                    questionId,
                    position
                }
            });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error("Errore nell'aggiunta della domanda al quiz:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};

/**
 * API Rimuovi Domanda da Quiz
 */

interface RemoveQuestionFromQuizParams {
    quizId: string,
    questionId: string
}

export const removeQuestionFromQuiz: RemoveQuestionFromQuiz<{}, {}> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    const { quizId, questionId } = req.params as RemoveQuestionFromQuizParams;

    try {
        await prisma.quizQuestion.delete({
            where: {
                quizId_questionId: {
                    quizId,
                    questionId
                }
            }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("Errore nella rimozione della domanda dal quiz:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};