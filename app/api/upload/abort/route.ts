import { NextResponse } from 'next/server';
import { S3Client, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const uploadId = url.searchParams.get('uploadId');
    const key = url.searchParams.get('key');

    if (!uploadId || !key) {
      return NextResponse.json(
        { error: 'Missing required parameters: uploadId, key' },
        { status: 400 }
      );
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET || '';

    const command = new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    });

    await s3Client.send(command);

    return NextResponse.json({
      message: 'Upload aborted successfully',
    });
  } catch (error) {
    console.error('Error aborting multipart upload:', error);
    return NextResponse.json(
      { error: 'Failed to abort upload' },
      { status: 500 }
    );
  }
}
