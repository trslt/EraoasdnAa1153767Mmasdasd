import {
    GetCourse,
    GetCourses,
    GetCourseCategories,
    GetCourseChapters,
} from 'wasp/server/operations';
import { 
    Course,
    CourseCategory,
    CourseChapter,
} from 'wasp/entities';


/** 
 * Get Course by ID - includes categories and instructors
 * 
 * @param args.courseId - Course ID
 */
export const getCourse: GetCourse<{ courseId: string }, Course | null> = async (args, context) => {

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
*/
export const getCourses: GetCourses<void, Course[]> = async (args, context) => {
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
export const getCourseChapters: GetCourseChapters<{ courseId: string }, CourseChapter[]> = async (args, context) => {

  return context.entities.CourseChapter.findMany({
    where: {
      courseId: args.courseId
    },
    orderBy: { position: 'asc' }
  })
}