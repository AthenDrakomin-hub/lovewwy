import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_SUPABASE_S3_ENDPOINT,
  region: process.env.NEXT_PUBLIC_SUPABASE_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET || '';

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 100
    });

    const response = await s3Client.send(command);
    const files = response.Contents?.map(file => ({
      key: file.Key,
      lastModified: file.LastModified,
      size: file.Size,
      storageClass: file.StorageClass,
      etag: file.ETag
    })) || [];

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing S3 files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' }, 
      { status: 500 }
    );
  }
}
