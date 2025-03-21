// TODO: create Badge
import { 
    BadgeCreate,
    BadgeUpdate,
    BadgeDelete,
    BadgeList
} from "wasp/server/api";
import { HttpError } from "wasp/server";
import { isAdmin } from "../../services/UserServices";
import { Badge } from 'wasp/entities';


/**
 * API Crea Badge
 * 
 * @param name nome del badge
 * @param code codice del badge
 * @param description descrizione del badge
 * @param imageUrl url dell'immagine del badge  
 * @param category categoria del badge
*/
type BadgeCreateBody = {
    name: string,
    code: string,
    description: string,
    imageUrl: string,
    category: string
};

export const badgeCreate: BadgeCreate<BadgeCreateBody, Badge> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { name, code, description, imageUrl, category } = req.body;

    try {
        const badge = await context.entities.Badge.create({
            data: {
                name,
                code,
                description,
                imageUrl,
                category
            }
        });
        
        return badge;
    } catch (error) {
        console.error("Error creating badge:", error);
        throw new HttpError(500, "Failed to create badge");
    }
}

/**
 * Api update Badge
 * 
 * @param badgeId id del badge
 * @param name nome del badge
 * @param code codice del badge
 * @param description descrizione del badge
 * @param imageUrl url dell'immagine del badge
 * @param category categoria del badge
*/

interface BadgeUpdateBody {
    name: string,
    code: string,
    description: string,
    imageUrl: string,
    category: string
};

interface BadgeUpdateParams { 
    badgeId: string;
};

export const badgeUpdate: BadgeUpdate<{}, Badge> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { badgeId } = req.params as BadgeUpdateParams;
    const { name, code, description, imageUrl, category } = req.body as BadgeUpdateBody;

    try {
        const badge = await context.entities.Badge.update({
            where: { id: badgeId },
            data: {
                name,
                code,
                description,
                imageUrl,
                category
            }
        });

        return badge;
    } catch (error) {
        console.error("Error updating badge:", error);
        throw new HttpError(500, "Failed to update badge");
    }

}

/**
 * API Cancella Badge
 * 
 * @param badgeId id del badge
*/

interface BadgeDeleteParams {
    badgeId: string;
}

export const badgeDelete: BadgeDelete<{}, void> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    const { badgeId } = req.params as BadgeDeleteParams;

    try {
        await context.entities.Badge.delete({ where: { id: badgeId } });
    } catch (error) {
        console.error("Error deleting badge:", error);
        throw new HttpError(500, "Failed to delete badge");
    }
}

/**
 * API Lista Badge
 * 
*/
export const badgeList: BadgeList<{}, Badge[]> = async (req, res, context) => {

    if (!isAdmin(context.user)) throw new HttpError(403);

    try {
        const badges = await context.entities.Badge.findMany();
        return badges;
    } catch (error) {
        console.error("Error listing badges:", error);
        throw new HttpError(500, "Failed to list badges");
    }
}