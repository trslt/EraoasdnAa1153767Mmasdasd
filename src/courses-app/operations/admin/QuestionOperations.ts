import { Prisma } from '@prisma/client';
import {
    GetQuestionListBySkill,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { isAdmin } from '../../services/UserServices';

/**
 * Ottiene domande per un dato skill con uno specifico livello
 * 
 * @param skillId - ID della skill
 * @param level - Livello della skill
 * @param limit - Limite massimo di domande da restituire
 */

type QuestionListBySkillArgs = { skillId: string; level?: number; limit?: number };

export const getQuestionListBySkill: GetQuestionListBySkill<QuestionListBySkillArgs, any> = async (args, context) => {
  
  if (!isAdmin(context.user)) throw new HttpError(403);

  // Verifica che l'utente sia autenticato e sia admin
  if (!context.user) {
    throw new HttpError(401, 'Non autorizzato');
  }
  
  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Accesso negato');
  }
  
  const { skillId, level, limit = 50 } = args;
  
  // Costruisci il filtro
  const where: Prisma.QuestionWhereInput = {
    skills: {
      some: {
        skillId
      }
    }
  };
  
  if (level !== undefined) {
    where.skills = {
      some: {
        skillId,
        level
      }
    };
  }
  
  try {
    // Recupera le domande filtrate per skill e livello
    const questions = await context.entities.Question.findMany({
      where,
      include: {
        translations: true,
        options: {
          include: {
            translations: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    return questions;
  } catch (error) {
    console.error('Errore nel recupero delle domande per skill:', error);
    throw new HttpError(500, 'Errore interno del server');
  }
};