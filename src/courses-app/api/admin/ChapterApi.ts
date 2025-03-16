'use server';

import {
  ChapterCreate,
} from "wasp/server/api";
import { Chapter } from 'wasp/entities';
import { HttpError } from "wasp/server";
import { isAdmin } from '../../services/UserServices';

/**
 * API Crea Capitolo
 * 
 * @param title string  Titolo del capitolo
 * @param courseId string  ID del corso
 * 
*/

interface ChapterCreateParams {
  title: string;
  courseId: string;
}

export const chapterCreate: ChapterCreate<{}, Chapter> = async (req, res, context) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { title } = req.body as ChapterCreateParams;
  const { courseId } = req.params as ChapterCreateParams;

  // Troviamo la posizione massima attuale
  const maxPositionResult = await context.entities.Chapter.aggregate({
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

  const chapter = await context.entities.Chapter.create({
    data: {
      title,
      courseId,
      position: newPosition
    }
  });

  res.json(chapter);
};