'use server';

import { isAdmin } from "../../services/UserServices"
import {
    CourseCreate,
    CourseUpdate,
    CourseCoverUpdate,
    CourseCategoryUpdate,
    CourseInstructorUpdate,
} from "wasp/server/api";
import { HttpError } from "wasp/server";
import { Course, CourseCategory } from 'wasp/entities';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

/**
 * API Crea Corso
 * 
 * @param title titolo del corso
 * @param description descrizione del corso
 * @param shortDescription descrizione breve del corso
 * 
*/

type CourseCreateProps = {
    title: string,
    description: string,
    shortDescription: string
};

export const courseCreate: CourseCreate<CourseCreateProps, Course> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { title, description, shortDescription } = req.body;

    const courseInfo = { title, description, shortDescription };

    const course = await context.entities.Course.create({ data: courseInfo });

    res.json(course);
};

/**
 * API Aggiorna un corso
 * 
 * @param courseId          Id del corso
 * @param title             Titolo del corso
 * @param description       Descrizione del corso 
 * @param shortDescription  Descrizione breve del corso
*/

interface CourseUpdateProps {
    courseId: string;
    title: string;
    description: string;
    shortDescription: string;
};

export const courseUpdate: CourseUpdate<{}, Course> = async (
    req: any,
    res: any,
    context: any
) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { courseId } = req.params as CourseUpdateProps;
    const { title, description, shortDescription } = req.body as CourseUpdateProps;

    try {
        const course = await prisma.course.update({
            where: { id: courseId },
            data: {
                title: title || undefined,
                description: description || undefined,
                shortDescription: shortDescription || undefined
            }
        });
    } catch (error: any) {
        if (error instanceof HttpError) {
            throw error;
        }
        console.error("Errore nell'aggiornamento del corso:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};


/**
 * API Aggiorna la copertina di un corso
 * 
 * @param courseId Id del corso
 * @param coverUrl URL della copertina
*/

interface CourseCoverUpdateProps {
    courseId: string;
    coverUrl: string;
};

export const courseCoverUpdate: CourseCoverUpdate<{}, Course> = async (
    req: any,
    res: any,
    context: any
) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { coverUrl } = req.body as CourseCoverUpdateProps;
    const { courseId } = req.params as CourseCoverUpdateProps;

    try {

        // Verifica che il corso esista
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            throw new HttpError(404, "Corso non trovato");
        }

        // Aggiorna la copertina del corso
        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: {
                image: coverUrl
            }
        });

        res.json({ course: updatedCourse });

    } catch (error: any) {

        if (error instanceof HttpError) {
            console.log(error.message)
            throw error;
        }
        console.error("Errore nell'aggiornamento della copertina del corso:", error);
        throw new HttpError(500, "Errore interno del server");
    }
}


/**
 * API Aggiorna le categorie di un corso
 * 
 * @param courseId     Id del corso
 * @param categoryIds  Id delle categorie
*/

interface CourseCategoryUpdateProps {
    courseId: string;
    categoryIds: number[];
};

export const courseCategoryUpdate: CourseCategoryUpdate<{}, CourseCategory[]> = async (
    req: any,
    res: any,
    context: any
) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { courseId } = req.params as CourseCategoryUpdateProps;
    const { categoryIds }: { categoryIds: number[] } = req.body as CourseCategoryUpdateProps;

    if (!Array.isArray(categoryIds)) {
        throw new HttpError(400, "categoryIds deve essere un array");
    }

    try {

        // Verifica che il corso esista e che l'utente sia autorizzato
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { instructors: true }
        });

        if (!course) {
            throw new HttpError(404, "Corso non trovato");
        }

        // // Verifica che l'utente sia un istruttore del corso o un admin
        // const isInstructor = course.instructors.some(
        //   instructor => instructor.userId === context.user.id
        // );
        // const isAdmin = context.user.isAdmin;

        // if (!isInstructor && !isAdmin) {
        //   throw new HttpError(403, "Non sei autorizzato a modificare questo corso");
        // }

        // Verifica che tutte le categorie esistano
        const existingCategories = await prisma.courseCategory.findMany({
            where: {
                id: {
                    in: categoryIds
                }
            }
        });

        if (existingCategories.length !== categoryIds.length) {
            throw new HttpError(400, "Alcune categorie non esistono");
        }

        // Aggiorna le categorie del corso (disconnette tutte le categorie esistenti e connette quelle nuove)
        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: {
                categories: {
                    set: categoryIds.map(id => ({ id }))
                }
            },
            include: {
                categories: true
            }
        });

        res.json({
            course: updatedCourse
        });

    } catch (error: any) {
        if (error instanceof HttpError) {
            throw error;
        }
        console.error("Errore nell'aggiornamento delle categorie:", error);
        throw new HttpError(500, "Errore interno del server");
    }

};


/**
 * API Aggiorna gli istruttori di un corso
 * 
 * @param courseId        Id del corso
 * @param instructorIds   Id degli istruttori
*/

interface CourseInstructorUpdateProps {
    courseId: string;
    instructorIds: string[];
};

export const courseInstructorUpdate: CourseInstructorUpdate<{}, CourseCategory[]> = async (
    req: any,
    res: any,
    context: any
) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { courseId } = req.params as CourseInstructorUpdateProps;
    const { instructorIds }: { instructorIds: string[] } = req.body as CourseInstructorUpdateProps;

    if (!Array.isArray(instructorIds)) {
        throw new HttpError(400, "instructorIds deve essere un array");
    }

    try {
        // Verifica che il corso esista
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { instructors: true }
        });

        if (!course) {
            throw new HttpError(404, "Corso non trovato");
        }

        // Verifica che tutti gli istruttori esistano
        const existingInstructors = await prisma.userInstructor.findMany({
            where: {
                id: {
                    in: instructorIds
                }
            }
        });

        if (existingInstructors.length !== instructorIds.length) {
            throw new HttpError(400, "Alcuni istruttori selezionati non esistono");
        }

        return prisma.$transaction(async (tx) => {

            await tx.courseInstructor.deleteMany({
                where: {
                    courseId: courseId
                }
            });

            await Promise.all(
                instructorIds.map(instructorId =>
                    prisma.courseInstructor.create({
                        data: {
                            courseId: courseId,
                            instructorId: instructorId,
                            // Se hai bisogno di impostare isOwner, dovresti aggiungere logica qui
                            // isOwner: instructorId === ownerInstructorId
                        }
                    })
                )
            );

            const updatedCourse = await prisma.course.findUnique({
                where: { id: courseId },
                include: {
                    instructors: {
                        include: {
                            instructor: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            email: true,
                                            username: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return res.json(updatedCourse);
        });

    } catch (error: any) {
        if (error instanceof HttpError) {
            throw error;
        }
        console.error("Errore nell'aggiornamento degli istruttori:", error);
        throw new HttpError(500, "Errore interno del server");
    }
};