import { type Course } from "wasp/entities";
import { api } from "wasp/client/api";
import axios from "axios";

// Costanti per gli endpoint API
const API_ENDPOINTS = {
    ADMIN_COURSE: "/api/admin/course",
    ADMIN_PERMISSION_UPLOAD: "/api/admin/permission/upload",
    COURSE: "/api/course",
};

/**
 * Crea un nuovo corso
 * @param courseInfo Le informazioni del corso da creare
 * @returns Il corso creato o null in caso di errore
 */
export const createCourse = async (courseInfo: Course): Promise<Course | null> => {

    const { title, shortDescription, description } = courseInfo;
    const payload = { title, shortDescription, description };

    try {
        const response = await api.post(API_ENDPOINTS.ADMIN_COURSE, payload);
        return response.data;
    } catch (error) {
        console.error("Errore durante la creazione del corso:", error instanceof Error ? error.message : 'Errore sconosciuto');
        throw error; // Propaghiamo l'errore per gestirlo nel componente
    }
};

/**
 * Aggiorna la cover di un corso
 * @param cover Il file della cover da aggiornare
 * @param courseId L'ID del corso da aggiornare
*/
export const updateCourseCover = async ({
    cover,
    courseId
}: { cover: File, courseId: string }) => {

    if (cover && (cover instanceof File)) {

        try {

            const payload = { fileType: cover.type, key: `course/${courseId}/cover` };

            const uploadUrl = await api.post(API_ENDPOINTS.ADMIN_PERMISSION_UPLOAD, payload)

            await axios.put(uploadUrl.data.uploadUrl, cover, { headers: { 'Content-Type': cover.type } });

            await api.put(`/api/admin/course/${courseId}/cover`, { coverUrl: uploadUrl.data.publicUrl });

        } catch (error) {
            throw error;
        }

    } else {
        throw new Error("Invalid cover file");
    }
}

/**
 * Aggiorna le categorie di un corso
 * @param categories Le categorie da aggiornare
 * @param courseId L'ID del corso da aggiornare
*/
export const updateCourseCategories = async ({
    categoryIds,
    courseId
}: { categoryIds: string[], courseId: string }) => {

    try {

        const payload = { categoryIds };

        await api.put(`${API_ENDPOINTS.ADMIN_COURSE}/${courseId}/categories`, payload);

    } catch (error) {
        throw error;
    }
}

/**
 * Aggiorna gli istruttori di un corso
 * @param instructors Gli istruttori da aggiornare
 * @param courseId L'ID del corso da aggiornare
*/
export const updateCourseInstructors = async ({
    instructorIds,
    courseId
}: { instructorIds: string[], courseId: string }) => {

    try {

        const payload = { instructorIds };

        await api.put(`${API_ENDPOINTS.ADMIN_COURSE}/${courseId}/instructors`, payload);

    } catch (error) {
        throw error;
    }
}

/**
 * Aggiorna le informazioni di un corso
 * @param courseId L'ID del corso da aggiornare
 * @param title Il titolo del corso
 * @param description La descrizione del corso
 * @param shortDescription La descrizione breve del corso
*/

type UpdateCourseParams = {
    courseId: string,
    title: string,
    description: string,
    shortDescription: string,
};

export const updateCourse = async ({
    courseId,
    title,
    description,
    shortDescription,
}: UpdateCourseParams) => {

    try {

        const payload = { title, description, shortDescription };

        await api.put(`${API_ENDPOINTS.ADMIN_COURSE}/${courseId}`, payload);

    } catch (error) {
        throw error;
    }
}

/**
 * Iscrizione ad un corso
 * @param courseId L'ID del corso a cui iscriversi
 */
export const courseEnrollment = async ({ courseId }: { courseId: string}) => {

    try {

        const enrollment = await api.post(`${API_ENDPOINTS.COURSE}/${courseId}/enroll`);

        return enrollment.data;

    } catch (error) {
        throw error;
    }
}