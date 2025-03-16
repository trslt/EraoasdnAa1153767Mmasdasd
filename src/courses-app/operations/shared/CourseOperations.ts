import {
    GetCourse,
    GetCourseList,
} from 'wasp/server/operations';
import { 
    Course,
} from 'wasp/entities';

/** 
 * Get Course by ID - includes categories and instructors
 * 
 * @param args.courseId - Course ID
 */

type CourseGetArgs = { courseId: string };
type CourseGetResult = Course | null;

export const getCourse: GetCourse<CourseGetArgs, CourseGetResult> = async (args, context) => {

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
export const getCourseList: GetCourseList<void, Course[]> = async (args, context) => {
  return context.entities.Course.findMany({
    orderBy: { id: 'desc' },
  })
}