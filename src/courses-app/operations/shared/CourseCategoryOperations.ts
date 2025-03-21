import {
    GetCourseCategoryList,
} from 'wasp/server/operations';
import {
    CourseCategory,
} from 'wasp/entities';

/**
 * Get all course categories
 * 
 * @param args - No arguments
*/
export const getCourseCategoryList: GetCourseCategoryList<void, CourseCategory[]> = async (args, context) => {
  return context.entities.CourseCategory.findMany({
    orderBy: { name: 'asc' },
  })
}