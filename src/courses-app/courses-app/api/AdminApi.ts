'use server';

import {
  CreateLesson,
  CreateCourseChapter,
  CreateCourse,
  UpdateCourseCategories,
  UpdateCourseCover,
  GetUploadPresignedURL,
  UpdateLessonContent,
  UpdateCourse,
} from "wasp/server/api";
import { Lesson, CourseChapter, Course } from 'wasp/entities';
import { HttpError } from "wasp/server";
import { CourseCategory, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import { getUploadPresignedUrl } from '../services/S3Services';
import { isAdmin } from '../services/UserServices';

type CreateLessonProps = {
  title: string,
  chapterId: string,
  courseId: string,
  lang: string,
  content: string
};

type GetPresignedUrlOutput = {
  uploadUrl: string,
  key: string,
  publicUrl: string
}

/**
 * API Crea Corso
*/
export const createCourse: CreateCourse<{ title: string, description: string, shortDescription: string }, Course> = async (req, res, context) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const data = req.body;

  const course = await context.entities.Course.create({ data });

  res.json(course);
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
export const createLesson: CreateLesson<CreateLessonProps, Lesson> = async (req, res, context) => {

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

/**
 * API Crea Capitolo
*/
export const createCourseChapter: CreateCourseChapter<{ title: string, courseId: string }, CourseChapter> = async (req, res, context) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { title } = req.body;
  const { courseId } = req.params;

  // Troviamo la posizione massima attuale
  const maxPositionResult = await context.entities.CourseChapter.aggregate({
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

  const courseChapter = await context.entities.CourseChapter.create({
    data: {
      title,
      courseId,
      position: newPosition
    }
  });

  res.json(courseChapter);
};



/**
 * API Aggiorna le categorie di un corso
*/
export const updateCourseCategories: UpdateCourseCategories<{}, CourseCategory[]> = async (
  req: any,
  res: any,
  context: any
) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { courseId } = req.params;
  const { categoryIds }: { categoryIds: number[] } = req.body;

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
export const updateCourseInstructors: UpdateCourseCategories<{}, CourseCategory[]> = async (
  req: any,
  res: any,
  context: any
) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { courseId } = req.params;
  const { instructorIds }: { instructorIds: string[] } = req.body;

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

export const getUploadPresignedURL: GetUploadPresignedURL<{}, GetPresignedUrlOutput> = async (
  req: any,
  res: any,
  context: any
) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { key, fileType } = req.body;

  try {

    const results = await getUploadPresignedUrl({ fileType, key });

    res.json(results);

  } catch (error: any) {

    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Errore nell'ottenimento del codice di uplaod", error);
    throw new HttpError(500, "Errore interno del server");
  }
}

/**
 * API Aggiorna gli istruttori di un corso
*/
export const updateCourseCover: UpdateCourseCover<{}, Course> = async (
  req: any,
  res: any,
  context: any
) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { coverUrl } = req.body;
  const { courseId } = req.params;

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

export const updateLessonContent: UpdateLessonContent<{}, Course> = async (
  req: any,
  res: any,
  context: any
) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { lang, content } = req.body;
  const { lessonId } = req.params;

  try {
    // TODO: Gestire versionamento contenuto lezioni
    const lessonContent = await prisma.lessonContent.findFirst({
      where: { lessonId: lessonId, lang }
    });

    if (!lessonContent) {
      throw new HttpError(404, "Contenuto della lezione non trovato");
    }

    const updatedLesson = await prisma.lessonContent.update({
      where: {
        lessonContentId:
        {
          lessonId,
          versionId: lessonContent?.versionId,
          lang,
        },
      },
      data: {
        content,
      },
    });

    return res.json({ lesson: updatedLesson });
  } catch (error: any) {

    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Errore nell'aggiornamento del contenuto della lezione:", error);
    throw new HttpError(500, "Errore interno del server");
  }
}

/**
 * API Aggiorna un corso
 * 
 * @param courseId          Id del corso
 * @param title             Titolo del corso
 * @param description       Descrizione del corso 
 * @param shortDescription  Descrizione breve del corso
*/
export const updateCourse: UpdateCourse<{}, Course> = async (
  req: any,
  res: any,
  context: any
) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { courseId } = req.params;
  const { title, description, shortDescription } = req.body;

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
