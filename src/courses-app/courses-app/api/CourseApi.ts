'use server';

import {
    CourseEnrollment,
} from "wasp/server/api";
import { Course } from "wasp/entities";
import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

/**
 * API Iscrizione al corso
 * 
 * @param courseId    Id del corso a cui iscriversi
 * @return            Oggetto iscrizione creato
 */
export const courseEnrollment: CourseEnrollment = async (req, res, context) => {

    try {
        // Ottieni l'ID del corso dalla richiesta
        const { courseId } = req.params;

        if (!courseId) {
            throw new HttpError(400, 'Course ID is required');
        }

        // Ottieni l'utente dalla richiesta
        const user = context.user;
        if (!user) {
            throw new HttpError(401, 'You must be logged in to enroll in courses');
        }

        // Verifica se il corso esiste
        const course = await context.entities.Course.findUnique({
            where: { id: courseId },
            include: {
                chapters: {
                    include: {
                        lessons: {
                            include: {
                                lesson: true,
                                lessonVersion: true
                            },
                            orderBy: {
                                position: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        });

        if (!course) {
            throw new HttpError(404, 'Course not found');
        }

        // TODO: Implementare la verifica della disponibilità del corso
        // if (!course.isPublished) {
        //     throw new HttpError(403, 'This course is not available for enrollment');
        // }

        // Verifica se l'utente è già iscritto al corso
        const existingEnrollment = await context.entities.CourseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId
                }
            }
        });

        if (existingEnrollment) {
            // Se l'utente è già iscritto, restituisci l'iscrizione esistente
            throw new HttpError(400, 'You are already enrolled in this course');
        }

        interface LessonType {
            id: string;
            title: string;
            activeVersionId: string | null;
            // altre proprietà necessarie
        }

        interface LessonVersionType {
            id: string;
            createdAt: Date;
            versionNumber: number;
            isPublished: boolean;
            lessonId: string;
            // altre proprietà necessarie
        }

        // Trova la prima lezione del corso
        let firstLesson: LessonType | null = null;
        let firstLessonVersion: LessonVersionType | null = null;

        if (course.chapters && course.chapters.length > 0) {
            const firstChapter = course.chapters[0];
            if (firstChapter.lessons && firstChapter.lessons.length > 0) {
                const firstLessonInChapter = firstChapter.lessons?.[0];
                firstLesson = firstLessonInChapter.lesson;
                firstLessonVersion = firstLessonInChapter.lessonVersion;
            }
        }

        if (!firstLesson || !firstLessonVersion) {
            throw new HttpError(404, 'Course has no lessons available');
        }

        // Utilizziamo una transazione per garantire l'atomicità delle operazioni
        return await prisma.$transaction(async (tx) => {
            // Crea l'iscrizione dell'utente
            const enrollment = await tx.courseEnrollment.create({
                data: {
                    student: { connect: { id: user.id } },
                    course: { connect: { id: courseId } },
                    currentLesson: { connect: { id: firstLesson.id } },
                    progressPercentage: 0
                }
            });

            // Crea solo il record di progresso per la prima lezione
            // Gli altri record verranno creati quando l'utente accederà alle rispettive lezioni
            await tx.studentProgress.create({
                data: {
                    userId: user.id,
                    courseId: courseId,
                    lessonId: firstLesson.id,
                    lessonVersionId: firstLessonVersion.id,
                    completed: false,
                    lastAccessed: new Date()
                }
            });

            // Aggiorna le streak se implementato
            // TODO: Implementare l'aggiornamento delle streak quando l'utente si iscrive a un nuovo corso

            // Invia una notifica o email all'utente (opzionale)
            // TODO: Implementare l'invio di notifiche o email

            
            // Restituisci l'iscrizione creata all'interno della transazione
            return res.json({

                nextLessonId: enrollment.currentLessonId
            });
        });

    } catch (error) {
        console.error('Error enrolling in course:', error);

        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'An error occurred while enrolling in the course'
        });
    }
};