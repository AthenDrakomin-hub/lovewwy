import { NextResponse } from 'next/server';
import { S3Client, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_SUPABASE_S3_ENDPOINT,
  region: process.env.NEXT_PUBLIC_SUPABASE_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
});

export async function POST(request: Request) {
  try {
    const { uploadId, key, parts } = await request.json();

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { error: 'Missing required parameters: uploadId, key, parts' },
        { status: 400 }
      );
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET || '';

    const command = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part: any) => ({
          ETag: part.ETag,
          PartNumber: part.PartNumber,
        })),
      },
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      location: response.Location,
      key: key,
    });
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}
