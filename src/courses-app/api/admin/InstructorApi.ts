import {
    InstructorCreate,
    InstructorDelete,
    InstructorList
} from "wasp/server/api";
import { HttpError } from "wasp/server";
import { isAdmin } from "../../services/UserServices";
import { UserInstructor, User } from 'wasp/entities';

/**
 * API Create UserInstructor
 * 
 * @param userId id dell'utente
 * @param instructorId id dell'istruttore
 */
type InstructorCreateBody = {
    userId: string;
}

export const instructorCreate: InstructorCreate<InstructorCreateBody, UserInstructor> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { userId } = req.body as InstructorCreateBody;
    
    try {

        const user = await context.entities.User.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Check if the user is admin
        if (!user.isAdmin) {
            throw new HttpError(400, "User is not an admin");
        }

        // Check if the user is already an instructor
        const userInstructorExists = await context.entities.UserInstructor.findUnique({
            where: { userId }
        }); 

        if (userInstructorExists) {
            throw new HttpError(400, "User is already an instructor");
        }

        // Create the userInstructor
        const userInstructor = await context.entities.UserInstructor.create({
            data: {
                user: {
                    connect: { id: userId }
                }
            }
        });

        return userInstructor;
    } catch (error) {
        console.error("Error creating userInstructor:", error);
        throw new HttpError(500, "Failed to create userInstructor");
    }
}

/**
 * API Delete UserInstructor
 * 
 * @param instructorId id dell'istruttore
 */

type InstructorDeleteParams = {
    instructorId: string;
}

export const instructorDelete: InstructorDelete<InstructorDeleteParams, void> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { instructorId } = req.params as InstructorDeleteParams;

    try {

        const userInstructorExists = await context.entities.UserInstructor.findUnique({
            where: { id: instructorId }
        });

        if (!userInstructorExists) {
            throw new HttpError(404, "UserInstructor not found");
        }

        await context.entities.UserInstructor.delete({
            where: { id: instructorId }
        });

        return;
    } catch (error) {
        console.error("Error deleting userInstructor:", error);
        throw new HttpError(500, "Failed to delete userInstructor");
    }
}

/**
 * API List Instructors
 * 
*/
export const instructorList: InstructorList<{}, UserInstructor[]> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    try {

        // TODO: Implement pagination
        const instructors = await context.entities.UserInstructor.findMany();

        return instructors;
    } catch (error) {
        console.error("Error listing instructors:", error);
        throw new HttpError(500, "Failed to list instructors");
    }
}