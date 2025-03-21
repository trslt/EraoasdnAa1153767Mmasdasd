import {
    SkillCreate,
    SkillUpdate,
    SkillDelete,
    SkillList
} from "wasp/server/api"
import { Skill } from 'wasp/entities';
import { HttpError } from "wasp/server";
import { isAdmin } from "../../services/UserServices";

/**
 * Api  create Skill
 * 
 * @param name nome della skill
 * @param description descrizione della skill
*/
type SkillCreateBody = {
    name: string,
    description: string
};

export const skillCreate: SkillCreate<{}, Skill> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    const { name, description } = req.body as SkillCreateBody;

    try {
        const skill = await context.entities.Skill.create({
            data: {
                name,
                description
            }
        });
        
        return skill;
    } catch (error) {
        console.error("Error creating skill:", error);
        throw new HttpError(500, "Failed to create skill");
    }
}

/**
 * Api update Skill
 * 
 * @param skillId id della skill
 * @param name nome della skill
 * @param description descrizione della skill
*/

type SkillUpdateBody = {
    name: string,
    description: string
};

type SkillUpdateParams = {
    skillId: string
};

export const skillUpdate: SkillUpdate<{}, Skill> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    const { skillId } = req.params as SkillUpdateParams;
    const { name, description } = req.body as SkillUpdateBody; 

    try {
        const skill = await context.entities.Skill.update({
            where: { id: skillId },
            data: {
                name: name || undefined,
                description: description || undefined
            }
        });

        return skill;
    } catch (error) {
        console.error("Error updating skill:", error);
        throw new HttpError(500, "Failed to update skill");
    }

}

/**
 * API Delete Skill
 * 
 * @param skillId id della skill
*/

type SkillDeleteParams = {
    skillId: string
};
export const skillDelete: SkillDelete<{}, {}> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    const { skillId } = req.params as SkillDeleteParams;

    try {

        await context.entities.Skill.delete({
            where: { id: skillId }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("Error deleting skill:", error);
        throw new HttpError(500, "Failed to delete skill");
    }
}

/**
 * API Skill List
*/
export const skillList: SkillList<{}, Skill[]> = async (req, res, context) => {
    
    if (!isAdmin(context.user)) throw new HttpError(403);

    // TODO: Aggiungere filtri per la ricerca
    try {
        const skills = await context.entities.Skill.findMany();

        return res.json(skills);
    } catch (error) {
        console.error("Error fetching skills:", error);
        throw new HttpError(500, "Failed to fetch skills");
    }
}