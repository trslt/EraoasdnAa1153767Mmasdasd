import { Prisma } from '@prisma/client';
import {
    GetQuestion,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';

/**
 * Ottiene una domanda specifica con tutte le sue opzioni e skill associate
 * 
 * @param questionId - ID della domanda
 */

type QuestionGetArgs = { questionId: string };

export const getQuestion: GetQuestion<QuestionGetArgs, any> = async (args, context) => {
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