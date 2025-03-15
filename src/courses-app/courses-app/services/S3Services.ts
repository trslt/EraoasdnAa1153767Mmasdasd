'use server';

import { randomUUID } from 'crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, ObjectCannedACL, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_S3_IAM_SECRET_KEY!,
  },
});

type S3Upload = {
  fileType: string;
  key: string;
}

export const getUploadPresignedUrl= async ({ fileType, key } : { fileType: string, key: string } ) => {
  
    const s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_IAM_SECRET_KEY!,
      },
    });
    
    const ex = fileType.split('/')[1];
    const Key = `${key}.${ex}`;
    const s3Params = {
        Bucket: process.env.AWS_S3_FILES_BUCKET,
        Key,
        ContentType: `${fileType}`,
        ACL: ObjectCannedACL.public_read
    };
  
    const command = new PutObjectCommand(s3Params);
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600,});
    
    const publicUrl = `https://${process.env.AWS_S3_FILES_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${Key}`;

    return { uploadUrl, key: Key, publicUrl };
  };


export const getDownloadFileSignedURLFromS3 = async ({ key }: { key: string }) => {
  const s3Params = {
    Bucket: process.env.AWS_S3_FILES_BUCKET,
    Key: key,
  };
  const command = new GetObjectCommand(s3Params);
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
