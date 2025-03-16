import {
    InstructorList,
} from "wasp/server/operations";
import { UserInstructor } from "wasp/entities";
import { HttpError } from "wasp/server";
import { isAdmin } from '../../services/UserServices';

/**
 * Get all instructors
 * 
 * @param args - none
 */

type InstructorListArgs = void;
type InstructorListResult = UserInstructor[];

export const instructorList: InstructorList<InstructorListArgs, InstructorListResult> = async (args, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

  return context.entities.UserInstructor.findMany({
    orderBy: { id: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      }
    },
  })
}