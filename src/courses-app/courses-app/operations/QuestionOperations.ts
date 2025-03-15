import { Prisma } from '@prisma/client';
import {
    GetQuestionsBySkill,
    GetQuestion,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';

/**
 * Ottiene una domanda specifica con tutte le sue opzioni e skill associate
 */
export const getQuestion: GetQuestion<{ questionId: string }, any> = async (args, context) => {
  // Verifica che l'utente sia autenticato
  if (!context.user) {
    throw new HttpError(401, 'Non autorizzato');
  }
  
  // Solo gli admin possono visualizzare domande individuali fuori dal contesto di un quiz
  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Accesso negato');
  }
  
  const { questionId } = args;
  
  try {
    // Recupera la domanda completa
    const question = await context.entities.Question.findUnique({
      where: { id: questionId },
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
        },
        quizQuestions: {
          include: {
            quiz: {
              include: {
                translations: true
              }
            }
          }
        }
      }
    });
    
    if (!question) {
      throw new HttpError(404, 'Domanda non trovata');
    }
    
    return question;
  } catch (error) {
    console.error('Errore nel recupero della domanda:', error);
    throw new HttpError(500, 'Errore interno del server');
  }
};

/**
 * Ottiene domande per un dato skill con uno specifico livello
 */
export const getQuestionsBySkill: GetQuestionsBySkill<{
  skillId: string;
  level?: number;
  limit?: number;
}, any> = async (args, context) => {
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