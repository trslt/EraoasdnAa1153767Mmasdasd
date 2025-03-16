import {
    CourseGet,
    CourseList,
    GetCourseCategories,
    GetCourseChapters,
    GetChapterNextLesson,
} from 'wasp/server/operations';
import { 
    Course,
    CourseCategory,
    Chapter,
    LessonsInChapters,
} from 'wasp/entities';
import { HttpError } from 'wasp/server';

/** 
 * Get Course by ID - includes categories and instructors
 * 
 * @param args.courseId - Course ID
 */

type CourseGetArgs = { courseId: string };
type CourseGetResult = Course | null;

export const courseGet: CourseGet<CourseGetArgs, CourseGetResult> = async (args, context) => {

    return context.entities.Course.findUnique({
      where: {
        id: args.courseId
      },
      include: {
        categories: true,
        instructors: {
          include: {
            instructor: {
              include: {
                user: {
                  select: { 
                    id: true,
                    username: true,
                  }
                }
              }
            }
          }
        }
      }
    })
  }

/**
 * Get all courses
 * 
 * // TODO: Add pagination, filtering, and sorting
 */
export const courseList: CourseList<void, Course[]> = async (args, context) => {
  return context.entities.Course.findMany({
    orderBy: { id: 'desc' },
  })
}

// Tutte le categorie
export const getCourseCategories: GetCourseCategories<void, CourseCategory[]> = async (args, context) => {
  return context.entities.CourseCategory.findMany({
    orderBy: { name: 'asc' },
  })
}

/* Tutti i capitoli di un corso */
export const getCourseChapters: GetCourseChapters<{ courseId: string }, Chapter[]> = async (args, context) => {

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
export const getChapterNextLesson: GetChapterNextLesson<
  { 
    chapterId: string; 
    userId?: string; 
    currentLessonId?: string;
  }, 
  { lesson: any | null; isLastInChapter: boolean }
> = async (args, context) => {

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