'use server';

import {
  GetUploadPresignedURL,
} from "wasp/server/api";
import { Course } from 'wasp/entities';
import { HttpError } from "wasp/server";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import { getUploadPresignedUrl } from '../services/S3Services';
import { isAdmin } from '../services/UserServices';

type GetPresignedUrlOutput = {
  uploadUrl: string,
  key: string,
  publicUrl: string
}

export const getUploadPresignedURL: GetUploadPresignedURL<{}, GetPresignedUrlOutput> = async (
  req: any,
  res: any,
  context: any
) => {

  if (!isAdmin(context.user)) throw new HttpError(403);

  const { key, fileType } = req.body;

  try {

    const results = await getUploadPresignedUrl({ fileType, key });

    res.json(results);

  } catch (error: any) {

    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Errore nell'ottenimento del codice di uplaod", error);
    throw new HttpError(500, "Errore interno del server");
  }
}

