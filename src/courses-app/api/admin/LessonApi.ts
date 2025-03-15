'use server';

import {
    LessonCreate,
} from "wasp/server/api";
import { Lesson, } from 'wasp/entities';
import { isAdmin } from '../../services/UserServices';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import { HttpError } from "wasp/server";

type LessonCreateProps = {
    title: string,
    chapterId: string,
    courseId: string,
    lang: string,
    content: string
};

/**
 * API Crea Lezione
 * 
 * @param title       Titolo della lezione
 * @param chapterId   Id del capitolo
 * @param courseId    Id del corso
 * @param lang        Lingua del contenuto
 * @param content     Contenuto della lezione
*/
export const lessonCreate: LessonCreate<LessonCreateProps, Lesson> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { title, courseId, lang, content } = req.body;
    const chapterId = req.body.chapterId;

    return prisma.$transaction(async (tx) => {

        // Troviamo la posizione massima attuale
        const maxPositionResult = await tx.lessonsInChapters.aggregate({
            where: {
                courseId
            },
            _max: {
                position: true
            }
        });

        // Determiniamo la nuova posizione
        // Se non ci sono capitoli esistenti, il risultato sarà null, quindi iniziamo da 0
        const newPosition = (maxPositionResult._max.position ?? -1) + 1;

        const lesson = await tx.lesson.create({
            data: {
                title,
            }
        });

        if (lesson) {
            const lessonVersion = await tx.lessonVersion.create({
                data: {
                    lessonId: lesson.id,
                    versionNumber: 1
                }
            });

            await tx.lessonsInChapters.create({
                data: {
                    lessonId: lesson.id,
                    chapterId,
                    courseId,
                    position: newPosition,
                    lessonVersionId: lessonVersion.id
                }
            });

            await tx.lessonsInCourses.create({
                data: {
                    lessonId: lesson.id,
                    courseId,
                    lessonVersionId: lessonVersion.id
                }
            });

            await tx.lesson.update({
                where: { id: lesson.id },
                data: { activeVersionId: lessonVersion.id }
            });

            await tx.lessonContent.create({
                data: {
                    lessonId: lesson.id,
                    lang,
                    content,
                    versionId: lessonVersion.id
                }
            });
        }

        return res.json(lesson);

    });
};