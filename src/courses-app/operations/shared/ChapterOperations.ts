import {
    GetCourseChapterList,
    GetChapterNextLesson,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import {
    Chapter,
    LessonsInChapters,
} from 'wasp/entities';

/** 
 * Tutti i capitoli di un corso
 * 
 * @paraam courseId - ID del corso
 * @returns Lista di capitoli
 */

type CourseChapterListArgs = { courseId: string };
type CourseChapterListResult = Chapter[];

export const getCourseChapterList: GetCourseChapterList<CourseChapterListArgs, CourseChapterListResult> = async (args, context) => {

    return context.entities.Chapter.findMany({
        where: {
            courseId: args.courseId
        },
        orderBy: { position: 'asc' }
    })
}


/**
 * Get the next lesson in a chapter for a specific user
 * 
 * @param args.chapterId - Chapter ID
 * @param args.userId - User ID (optional) - If provided, will consider user progress
 * @param args.currentLessonId - Current lesson ID (optional) - If provided, will get the next lesson after this one
 */

type ChapterNextLessonGetArgs = { 
    chapterId: string; 
    userId?: string; 
    currentLessonId?: string;
};

export const getChapterNextLesson: GetChapterNextLesson<ChapterNextLessonGetArgs> = async (args, context) => {

  const userId = args.userId || !context.user!.id;
  
  if(userId !== context.user!.id) {
    throw new HttpError(403, 'Unauthorized');
  }
  
  // Trova il capitolo e le sue lezioni ordinate per posizione
  const chapter = await context.entities.Chapter.findUnique({
    where: {
      id: args.chapterId
    },
    include: {
      lessons: {
        orderBy: {
          position: 'asc'
        },
        include: {
          lesson: true
        }
      },
      course: {
        select: {
          id: true
        }
      }
    }
  });

  if (!chapter) {
    return { lesson: null, isLastInChapter: false };
  }

  // Se non c'è un ID lezione corrente, restituisci la prima lezione del capitolo
  if (!args.currentLessonId) {
    if (chapter.lessons.length === 0) {
      return { lesson: null, isLastInChapter: false };
    }
    
    return { 
      lesson: chapter.lessons[0].lesson,
      isLastInChapter: chapter.lessons.length === 1
    };
  }

  // Trova l'indice della lezione corrente nel capitolo
  const currentLessonIndex = chapter.lessons.findIndex(
    (lessonInChapter: LessonsInChapters) => lessonInChapter.lessonId === args.currentLessonId
  );

  if (currentLessonIndex === -1) {
    // La lezione corrente non fa parte di questo capitolo
    return { lesson: null, isLastInChapter: false };
  }

  // Controlla se la lezione corrente è l'ultima nel capitolo
  if (currentLessonIndex >= chapter.lessons.length - 1) {
    return { lesson: null, isLastInChapter: true };
  }

  // Ottieni la prossima lezione
  const nextLesson = chapter.lessons[currentLessonIndex + 1].lesson;
  
  // Se c'è un userId, controlla i permessi per accedere alla lezione
  if (args.userId) {
    // Verifica se l'utente è iscritto al corso
    const enrollment = await context.entities.CourseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: args.userId,
          courseId: chapter.course.id
        }
      }
    });

    if (!enrollment) {
      // L'utente non è iscritto al corso
      return { lesson: null, isLastInChapter: false };
    }

    // Verifica il progresso dell'utente
    const progress = await context.entities.StudentProgress.findUnique({
      where: {
        userId_courseId_lessonId: {
          userId: args.userId,
          courseId: chapter.course.id,
          lessonId: args.currentLessonId
        }
      }
    });

    // Se non ha completato la lezione corrente, non può accedere alla prossima
    // A meno che non si tratti della prima lezione del capitolo
    if (currentLessonIndex > 0 && (!progress || !progress.completed)) {
      return { lesson: null, isLastInChapter: false };
    }
  }

  return { 
    lesson: nextLesson, 
    isLastInChapter: currentLessonIndex + 1 === chapter.lessons.length - 1
  };
}