<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Misoaa9wLoODK9Qf5Qm6nuNEcZy0CQzQ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Configure S3 storage (optional but recommended for music files):
   - Copy `.env.local.example` to `.env.local` if it doesn't exist
   - Set S3 configuration variables (see S3 Configuration section below)
4. Run the app:
   `npm run dev`

## S3 Configuration

This project uses S3-compatible storage for music files. The configuration supports:
- Supabase Storage (default)
- Other S3-compatible services (MinIO, Cloudflare R2, AWS S3, etc.)

### Environment Variables

Add these to your `.env.local` file:

```bash
# S3 Configuration
S3_ENDPOINT=https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3
S3_REGION=ap-south-1
S3_ACCESS_KEY_ID=f38ef481de3083a75df0a4641914962a
S3_SECRET_ACCESS_KEY=7d3bbaf345256cb64e9e377457018f8cdc4013aa6ec0d9a6d87e4d2e1003c91c

# For Vite (frontend)
VITE_S3_ENDPOINT=https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3
VITE_S3_REGION=ap-south-1
VITE_S3_ACCESS_KEY_ID=f38ef481de3083a75df0a4641914962a
VITE_S3_SECRET_ACCESS_KEY=7d3bbaf345256cb64e9e377457018f8cdc4013aa6ec0d9a6d87e4d2e1003c91c
```

### Testing S3 Connection

1. Update the bucket name in `lib/s3.ts` (default is `wangyiyun`)
2. Navigate to the Test S3 Connection page in the app
3. Or run the test script: `node test-s3.js`

### Supported S3 Services

1. **Supabase Storage**: Uses special public URL format
2. **Other S3-compatible services**: Uses standard path-style URL format (`https://endpoint/bucket/key`)

The `getPublicUrl()` function in `lib/s3.ts` automatically detects the service type and generates the correct public URL.

### File Structure

Music files should be uploaded to the `music/` directory in your S3 bucket:
- `music/aisinishiyigecuo.mp3`
- `music/anheqiao.mp3`
- etc.

The project automatically converts relative paths in `constants.ts` to full S3 URLs using the `getPublicUrl()` function.
