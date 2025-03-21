'use server';

import {
  LessonMarkComplete,
} from "wasp/server/api";
import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API per marcare una lezione come completata
 * 
 * @param lessonId    Id della lezione
 * @param courseId    Id del corso
 * @param completed   Stato di completamento
 * @return            Oggetto progresso aggiornato
 */
export const lessonMarkComplete: LessonMarkComplete = async (req, res, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Non autorizzato');
  }

  try {
    const { lessonId, courseId, completed } = req.body;

    if (!lessonId || !courseId) {
      throw new HttpError(400, 'lessonId e courseId sono richiesti');
    }

    // Verifica che l'utente sia iscritto al corso
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: context.user.id,
          courseId
        }
      }
    });

    if (!enrollment) {
      throw new HttpError(403, 'Non sei iscritto a questo corso');
    }

    // Ottieni la versione attiva della lezione
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { activeVersionId: true }
    });

    if (!lesson || !lesson.activeVersionId) {
      throw new HttpError(404, 'Lezione non trovata o senza versione attiva');
    }

    // Aggiorna o crea un record di progresso
    const progress = await prisma.studentProgress.upsert({
      where: {
        userId_courseId_lessonId: {
          userId: context.user.id,
          courseId,
          lessonId
        }
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        lastAccessed: new Date()
      },
      create: {
        userId: context.user.id,
        courseId,
        lessonId,
        lessonVersionId: lesson.activeVersionId,
        completed,
        completedAt: completed ? new Date() : null,
        lastAccessed: new Date()
      }
    });

    // Se completata, aggiorna anche l'ultima lezione completata nell'iscrizione
    if (completed) {
      await prisma.courseEnrollment.update({
        where: { id: enrollment.id },
        data: { lastCompletedId: lessonId }
      });

      // Calcola la percentuale di completamento del corso
      const totalLessonsInCourse = await prisma.lessonsInCourses.count({
        where: { courseId }
      });
      
      const completedLessons = await prisma.studentProgress.count({
        where: {
          userId: context.user.id,
          courseId,
          completed: true
        }
      });

      // Aggiorna la percentuale di completamento
      if (totalLessonsInCourse > 0) {
        const progressPercentage = Math.round((completedLessons / totalLessonsInCourse) * 100);
        
        await prisma.courseEnrollment.update({
          where: { id: enrollment.id },
          data: { progressPercentage }
        });
      }
    }

    return res.json(progress);
  } catch (error) {
    console.error('Errore nel marcare la lezione come completata:', error);
    
    if (error instanceof HttpError) {
      throw error;
    }
    
    throw new HttpError(500, 'Errore interno del server');
  }
};