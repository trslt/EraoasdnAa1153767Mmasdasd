import {
    Lesson,
    LessonContent,
    LessonsInChapters
  } from 'wasp/entities'
  import {
    GetLesson,
    GetLessonContents,
    GetLessonsByChapterIDs
  } from 'wasp/server/operations'
  
  
  /* Get Lesson */
  export const getLesson: GetLesson<{ lessonId: string }, Lesson | null> = async (args, context) => {
  
    return context.entities.Lesson.findUnique({
      where: {
        id: args.lessonId
      },
    })
  }
  
  /* Get Lesson Content */
  export const getLessonContents: GetLessonContents<{ lessonId: string, lang: string }, LessonContent[] | null> = async (args, context) => {
  
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