import { NextResponse } from 'next/server';
import { S3Client, UploadPartCommand } from '@aws-sdk/client-s3';

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

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const uploadId = url.searchParams.get('uploadId');
    const key = url.searchParams.get('key');
    const partNumber = parseInt(url.searchParams.get('partNumber') || '0');

    if (!uploadId || !key || !partNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters: uploadId, key, partNumber' },
        { status: 400 }
      );
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET || '';
    const body = await request.arrayBuffer();

    const command = new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: new Uint8Array(body),
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      ETag: response.ETag,
      PartNumber: partNumber,
    });
  } catch (error) {
    console.error('Error uploading part:', error);
    return NextResponse.json(
      { error: 'Failed to upload part' },
      { status: 500 }
    );
  }
}
