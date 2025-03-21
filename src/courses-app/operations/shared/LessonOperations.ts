import {
    Lesson,
    LessonContent,
    LessonsInChapters
  } from 'wasp/entities'
  import {
    GetLesson,
    GetLessonContent,
    GetLessonsByChapterIDs
  } from 'wasp/server/operations'
  
  
  /**
   * Get Lesson
   * 
   * @param lessonId - Lesson ID 
   */

  type LessonGetArgs = { lessonId: string };

  export const getLesson: GetLesson<LessonGetArgs, Lesson | null> = async (args, context) => {
  
    return context.entities.Lesson.findUnique({
      where: {
        id: args.lessonId
      },
    })
  }
  
  /** 
   * Get Lesson Content
   *
   * @param lessonId - Lesson ID
   * @param lang - Language 
   */

  type LessonContentGetArgs = { lessonId: string, lang: string };

  export const getLessonContent: GetLessonContent<LessonContentGetArgs, LessonContent[] | null> = async (args, context) => {
  
    return context.entities.LessonContent.findMany({
      where: {
        lessonId: args.lessonId,
        lang: args.lang
      }
    })
  }
  
  
  /* Get Lessons by course Id */
  export const getLessonsByChapterIDs: GetLessonsByChapterIDs<{ chapterIDs: string[] }, (LessonsInChapters & { lesson: { id: string, title: string }})[]> = async (args, context) => {
  
    return context.entities.LessonsInChapters.findMany({
      where: {
        chapterId:
        {
          in: args.chapterIDs
        }
      },
      orderBy: { position: 'asc' },
      include: {
        lesson: {
          select: {
            id: true,
            title: true
          }
        }
      },
    })
  }