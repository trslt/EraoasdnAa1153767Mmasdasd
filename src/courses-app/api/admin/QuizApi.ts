'use server';

import {
    QuizCreate,
    QuizUpdate,
    QuizDelete,
    QuizList,
} from "wasp/server/api";
import { Quiz } from 'wasp/entities';

import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../../services/UserServices';

const prisma = new PrismaClient();

/**
 * API Crea Quiz
 * 
 * @param isActive boolean  Indica se il quiz è attivo
 * @param passingThreshold number  Punteggio minimo per superare il quiz
 * @param translations QuizTranslationsType[]  Traduzioni del quiz
 */

type QuizTranslationsType = {
    language: string,
    title: string,
    description?: string,
    instructions?: string
};

interface QuizRequestBody {
    isActive: boolean;
    passingThreshold: number;
    translations: QuizTranslationsType[];
}

export const quizCreate: QuizCreate<{}, Quiz> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { isActive, passingThreshold, translations } = req.body as QuizRequestBody;

    try {
        return prisma.$transaction(async (tx) => {

            // Crea il quiz
            const quiz = await tx.quiz.create({
                data: {
                    isActive,
                    passingThreshold,
                }
            });

            // Aggiungi le traduzioni
            if (translations && translations.length > 0) {
                await Promise.all(
                    translations.map((translation: QuizTranslationsType) =>
                        tx.quizTranslation.create({
                            data: {
                                quizId: quiz.id,
                                language: translation.language,
                                title: translation.title,
                                description: translation.description,
                                instructions: translation.instructions
                            }
                        })
                    )
                );
            }

            // Restituisci il quiz con le traduzioni
            const quizWithTranslations = await tx.quiz.findUnique({
                where: { id: quiz.id },
                include: { translations: true }
            });

            return res.json(quizWithTranslations!);
        });
    } catch (error) {
        console.error("Errore nella creazione del quiz:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};


/**
 * API Aggiorna Quiz
 * 
 * @param isActive boolean  Indica se il quiz è attivo
 * @param passingThreshold number  Punteggio minimo per superare il quiz
 * @param translations QuizTranslationsType[]  Traduzioni del quiz
 */

interface UpdateQuizRequestBody {
    isActive: boolean;
    passingThreshold: number;
    translations: QuizTranslationsType[];
}

interface UpdateQuizParams {
    quizId: string;
}

export const quizUpdate: QuizUpdate<{}, Quiz> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { quizId } = req.params as UpdateQuizParams;
    const { isActive, passingThreshold, translations } = req.body as UpdateQuizRequestBody;

    try {
        return prisma.$transaction(async (tx) => {
            // Aggiorna il quiz
            const quiz = await tx.quiz.update({
                where: { id: quizId },
                data: {
                    isActive,
                    passingThreshold,
                }
            });

            // Aggiorna le traduzioni
            if (translations && translations.length > 0) {
                // Opzionalmente, puoi rimuovere le traduzioni esistenti
                await tx.quizTranslation.deleteMany({
                    where: { quizId }
                });

                // Aggiungi le nuove traduzioni
                await Promise.all(
                    translations.map(translation =>
                        tx.quizTranslation.create({
                            data: {
                                quizId,
                                language: translation.language,
                                title: translation.title,
                                description: translation.description,
                                instructions: translation.instructions
                            }
                        })
                    )
                );
            }

            // Restituisci il quiz aggiornato con le traduzioni
            const updatedQuiz = await tx.quiz.findUnique({
                where: { id: quizId },
                include: { translations: true }
            });

            return res.json(updatedQuiz!);
        });
    } catch (error) {
        console.error("Errore nell'aggiornamento del quiz:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};


/**
 * API Elimina Quiz
 * 
 * @param quizId string  ID del quiz
 */

interface DeleteQuizParams {
    quizId: string;
}

export const quizDelete: QuizDelete<{}, {}> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { quizId } = req.params as DeleteQuizParams;

    try {

        await prisma.quiz.delete({
            where: { id: quizId }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("Errore nell'eliminazione del quiz:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};

/**
 * API Quiz List
*/
export const quizList: QuizList<{}, Quiz[]> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    try {
        const quizzes = await prisma.quiz.findMany();

        return res.json(quizzes);
    } catch (error) {
        console.error("Errore nel recupero della lista dei quiz:", error);
        throw new HttpError(500, "Errore interno del server");
    }
}