'use server';

import {
  CreateCourseChapter,
  GetUploadPresignedURL,
  UpdateLessonContent,
} from "wasp/server/api";
import { CourseChapter, Course } from 'wasp/entities';
import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import { getUploadPresignedUrl } from '../services/S3Services';
import { isAdmin } from '../services/UserServices';

type GetPresignedUrlOutput = {
  uploadUrl: string,
  key: string,
  publicUrl: string
}

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
