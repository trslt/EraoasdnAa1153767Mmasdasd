'use server';

import {
    LessonContentUpdate,
} from "wasp/server/api";
import { LessonContent } from 'wasp/entities';
import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../../services/UserServices';
const prisma = new PrismaClient();

/**
 * API Aggiorna contenuto lezione
 * 
 * @param lang string  Lingua del contenuto
 * @param content string  Contenuto della lezione
 */

interface LessonContentUpdateParams {
    lang: string;
    content: string;
    lessonId: string;
}

export const lessonContentUpdate: LessonContentUpdate<{}, LessonContent> = async (
    req: any,
    res: any,
    context: any
  ) => {
  
    if (!isAdmin(context.user)) throw new HttpError(403);
  
    const { lang, content } = req.body as LessonContentUpdateParams;
    const { lessonId } = req.params as LessonContentUpdateParams;
  
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
  
      return res.json(updatedLesson);
    } catch (error: any) {
  
      if (error instanceof HttpError) {
        throw error;
      }
      console.error("Errore nell'aggiornamento del contenuto della lezione:", error);
      throw new HttpError(500, "Errore interno del server");
    }
  }