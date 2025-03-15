'use server';

import {
    CreateQuestion,
    UpdateQuestion,
    DeleteQuestion
} from "wasp/server/api";
import {
    Question,
    type Option,
    type QuestionSkill,
    type QuestionTranslation,
    type OptionTranslation,
} from 'wasp/entities';
import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../services/UserServices';

const prisma = new PrismaClient();

/**
 * API Crea Domanda
 */

interface CreateQuestionBody {
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE',
    weight: number,
    translations: { language: string, text: string, explanation?: string }[],
    options: {
        isCorrect: boolean,
        position: number,
        translations: { language: string, text: string }[]
    }[],
    skills?: { skillId: string, level: number }[]
}

export const createQuestion: CreateQuestion<{}, Question> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { type, weight, translations, options, skills } = req.body as CreateQuestionBody;

    try {
        return prisma.$transaction(async (tx) => {
            // Crea la domanda
            const question = await tx.question.create({
                data: {
                    type,
                    weight
                }
            });

            // Aggiungi le traduzioni
            if (translations && translations.length > 0) {
                await Promise.all(
                    translations.map(translation =>
                        tx.questionTranslation.create({
                            data: {
                                questionId: question.id,
                                language: translation.language,
                                text: translation.text,
                                explanation: translation.explanation
                            }
                        })
                    )
                );
            }

            // Aggiungi le opzioni
            if (options && options.length > 0) {
                await Promise.all(
                    options.map(option =>
                        tx.option.create({
                            data: {
                                questionId: question.id,
                                isCorrect: option.isCorrect,
                                position: option.position,
                                translations: {
                                    create: option.translations.map(t => ({
                                        language: t.language,
                                        text: t.text
                                    }))
                                }
                            }
                        })
                    )
                );
            }

            // Aggiungi le skill associate
            if (skills && skills.length > 0) {
                await Promise.all(
                    skills.map(skill =>
                        tx.questionSkill.create({
                            data: {
                                questionId: question.id,
                                skillId: skill.skillId,
                                level: skill.level
                            }
                        })
                    )
                );
            }

            // Restituisci la domanda completa
            const completeQuestion = await tx.question.findUnique({
                where: { id: question.id },
                include: {
                    translations: true,
                    options: {
                        include: {
                            translations: true
                        }
                    },
                    skills: {
                        include: {
                            skill: true
                        }
                    }
                }
            });

            return res.json(completeQuestion!);
        });
    } catch (error) {
        console.error("Errore nella creazione della domanda:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};

/**
 * API Aggiorna Domanda
 */

interface UpdateQuestionBody {
    type: string;
    weight: number;
    translations: any,
    options: Option,
    skills: QuestionSkill
}

interface UpdateQuestionParams {
    questionId: string
}

export const updateQuestion: UpdateQuestion<{}, Question> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { questionId } = req.params as UpdateQuestionParams;
    const { type, weight, translations, options, skills } = req.body;

    try {
        return prisma.$transaction(async (tx) => {
            // Aggiorna la domanda
            const question = await tx.question.update({
                where: { id: questionId },
                data: {
                    type,
                    weight
                }
            });

            // Aggiorna le traduzioni
            if (translations && translations.length > 0) {
                // Rimuovi le traduzioni esistenti
                await tx.questionTranslation.deleteMany({
                    where: { questionId }
                });

                // Aggiungi le nuove traduzioni
                await Promise.all(
                    translations.map((translation: QuestionTranslation) =>
                        tx.questionTranslation.create({
                            data: {
                                questionId,
                                language: translation.language,
                                text: translation.text,
                                explanation: translation.explanation
                            }
                        })
                    )
                );
            }

            // Aggiorna le opzioni
            if (options && options.length > 0) {
                // Rimuovi le opzioni esistenti (e le loro traduzioni)
                await tx.option.deleteMany({
                    where: { questionId }
                });

                // Aggiungi le nuove opzioni
                await Promise.all(
                    options.map((option: Option & { translations: OptionTranslation[] }) =>
                        tx.option.create({
                            data: {
                                questionId,
                                isCorrect: option.isCorrect,
                                position: option.position,
                                translations: {
                                    create: option.translations.map(t => ({
                                        language: t.language,
                                        text: t.text
                                    }))
                                }
                            }
                        })
                    )
                );
            }

            // Aggiorna le skill associate
            if (skills && skills.length > 0) {
                // Rimuovi le associazioni esistenti
                await tx.questionSkill.deleteMany({
                    where: { questionId }
                });

                // Aggiungi le nuove associazioni
                await Promise.all(
                    skills.map((skill: QuestionSkill) =>
                        tx.questionSkill.create({
                            data: {
                                questionId,
                                skillId: skill.skillId,
                                level: skill.level
                            }
                        })
                    )
                );
            }

            // Restituisci la domanda completa aggiornata
            const updatedQuestion = await tx.question.findUnique({
                where: { id: questionId },
                include: {
                    translations: true,
                    options: {
                        include: {
                            translations: true
                        }
                    },
                    skills: {
                        include: {
                            skill: true
                        }
                    }
                }
            });

            return res.json(updatedQuestion!);
        });
    } catch (error) {
        console.error("Errore nell'aggiornamento della domanda:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};

/**
 * API Elimina Domanda
 */

interface DeleteQuestionParams {
    questionId: string
}

export const deleteQuestion: DeleteQuestion<{}, {}> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { questionId } = req.params as DeleteQuestionParams;

    try {
        await prisma.question.delete({
            where: { id: questionId }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("Errore nell'eliminazione della domanda:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};