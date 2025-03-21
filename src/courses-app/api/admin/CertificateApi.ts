import {
    CertificateCreate,
    CertificateUpdate,
    CertificateDelete,
    CertificateList,
} from "wasp/server/api";
import {
    Certificate
} from 'wasp/entities';
import { HttpError } from "wasp/server";
import { isAdmin } from "../../services/UserServices";

/**
 * API Create Certificate
 * 
 * @param name nome del certificato
 * @param description descrizione del certificato
 * @param imageUrl url dell'immagine del certificato
 * @param courseId id del corso
*/

type CertificateCreateBody = {
    name: string,
    description: string,
    imageUrl: string,
    courseId: string
};

export const certificateCreate: CertificateCreate<CertificateCreateBody, Certificate> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    const { name, description, imageUrl, courseId } = req.body as CertificateCreateBody;

    try {

        const certificate = await context.entities.Certificate.create({
            data: {
                name,
                description,
                imageUrl,
                course: {
                    connect: { id: courseId }
                }
            }
        });

        return certificate;
    } catch (error) {
        console.error("Error creating certificate:", error);
        throw new HttpError(500, "Failed to create certificate");
    }
}

/**
 * API Update Certificate
 * 
 * @param certificateId id del certificato
 * @param name nome del certificato
 * @param description descrizione del certificato
 * @param imageUrl url dell'immagine del certificato
 * @param courseId id del corso
*/

type CertificateUpdateBody = {
    name: string;
    description: string;
    imageUrl: string;
};

type CertificateUpdateParams = {
    certificateId: string;
};

export const certificateUpdate: CertificateUpdate<{}, Certificate> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    const { certificateId } = req.params as CertificateUpdateParams;
    const { name, description, imageUrl } = req.body as CertificateUpdateBody;

    try {
        const certificate = await context.entities.Certificate.update({
            where: { id: certificateId },
            data: {
                name: name || undefined,
                description: description || undefined,
                imageUrl: imageUrl || undefined
            }
        });

        return certificate;
    } catch (error) {
        console.error("Error updating certificate:", error);
        throw new HttpError(500, "Failed to update certificate");
    }
}

/**
 * API Delete Certificate
 * 
 * @param certificateId id del certificato
*/

type CertificateDeleteParams = {
    certificateId: string;
};

export const certificateDelete: CertificateDelete<{}, void> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    const { certificateId } = req.params as CertificateDeleteParams;

    // TODO: Aggiungere controllo/soft delete e verificare che il certificato non sia associato a nessun utente o corso attivo
    try {
        const certificate = await context.entities.Certificate.delete({
            where: { id: certificateId }
        });

        return certificate;
    } catch (error) {
        console.error("Error deleting certificate:", error);
        throw new HttpError(500, "Failed to delete certificate");
    }
}

/**
 * API List Certificates
*/
export const certificateList: CertificateList<{}, Certificate> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    try {

        // TODO: aggiungere filtri e paginazione

        const certificates = await context.entities.Certificate.findMany();

        return certificates;
    } catch (error) {
        console.error("Error listing certificates:", error);
        throw new HttpError(500, "Failed to list certificates");
    }
}
