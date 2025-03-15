'use server';

import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import crypto from 'crypto';
import axios from 'axios';
import { getUploadPresignedUrl } from '../services/S3Services';

const prisma = new PrismaClient();

export async function generateCertificateAssertion(certificateId: string, userId: string) {

  // 1. Recupera informazioni sul badge e l'utente
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: { course: true }
  });
  
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!certificate || !user) {
    throw new Error('Badge o utente non trovati');
  }
  
  // 2. Crea l'ID univoco per l'assertion
  const assertionId = crypto.randomUUID();
  
  // 3. Crea i metadati dell'Open Badge in formato JSON-LD
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/api/certificate/${assertionId}/verify`;
  
  const certificateAssertion = {
    "@context": "https://w3id.org/openbadges/v2",
    "type": "Assertion",
    "id": verificationUrl,
    "recipient": {
      "type": "email",
      "identity": user.email,
      "hashed": false
    },
    "badge": {
      "type": "BadgeClass",
      "id": `${baseUrl}/badges/${certificate.id}`,
      "name": certificate.name,
      "description": certificate.description,
      "image": certificate.imageUrl,
      "criteria": {
        "narrative": `Completamento del corso "${certificate.course.title}" con un punteggio di almeno 90% nei quiz.`
      },
      "issuer": {
        "type": "Issuer",
        "id": `${baseUrl}/issuer`,
        "name": "Youpiter Learning Platform",
        "url": baseUrl,
        "email": "courses@youpiter.ai"
      }
    },
    "verification": {
      "type": "HostedBadge"
    },
    "issuedOn": new Date().toISOString()
  };
  
  // 4. Salva l'assertion nel database
  const createdAssertion = await prisma.certificateAssertion.create({
    data: {
      id: assertionId,
      certificateId: certificate.id,
      userId: user.id,
      verificationUrl
    }
  });
  
  // // 5. Genera l'immagine del badge con i metadati embedded
  // const certificateImage = await embedMetadataInImage(certificate.imageUrl, certificateAssertion);
  
  // // 6. Carica l'immagine del badge su S3
  // const badgePath = `certificates/${user.id}/${assertionId}.png`;
  // const uploadUrl = await uploadBadgeToS3(badgePath, certificateImage);
  
  return {
    assertion: createdAssertion,
    //certificateImageUrl: uploadUrl,
    verificationUrl
  };
}

async function embedMetadataInImage(imageUrl: string, metadata: any) {
  // Scarica l'immagine originale
  const response = await fetch(imageUrl);
  const imageBuffer = await response.arrayBuffer();
  
  // Converti i metadati in stringa JSON
  const jsonMetadata = JSON.stringify(metadata);
  
  // Usa Sharp per incorporare i metadati come tEXt chunk in un PNG
  return await sharp(Buffer.from(imageBuffer))
    .withMetadata({
      exif: {
        IFD0: {
          openbadges: jsonMetadata
        }
      }
    })
    .png()
    .toBuffer();
}

const uploadBadgeToS3 = async (certficatePath: string, badgeImage: Buffer) => {

    const uploadUrl = await getUploadPresignedUrl({
      fileType: 'image/png',
      key: certficatePath
    });

    await axios.put(uploadUrl.uploadUrl, badgeImage, {
      headers: {
        'Content-Type': 'image/png'
      }
    });

    return `https://${process.env.AWS_S3_FILES_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${certficatePath}`;
}