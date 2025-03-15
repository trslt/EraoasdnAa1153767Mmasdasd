import { GetUserInstructors } from "wasp/server/operations";
import { UserInstructor } from "wasp/entities";

// Tutti gli istruttori
export const getUserInstructors: GetUserInstructors<void, UserInstructor[]> = async (args, context) => {
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