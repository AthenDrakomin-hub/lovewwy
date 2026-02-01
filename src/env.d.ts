/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_S3_PUBLIC_BASE_URL?: string;
  readonly VITE_SUPABASE_S3_ENDPOINT?: string;
  readonly VITE_SUPABASE_S3_REGION?: string;
  readonly VITE_SUPABASE_S3_ACCESS_KEY_ID?: string;
  readonly VITE_SUPABASE_S3_SECRET_ACCESS_KEY?: string;
  readonly VITE_SUPABASE_S3_BUCKET?: string;
  readonly VITE_SUPABASE_AUTH_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PASSWORD_HASH?: string;
  readonly VITE_TEMP_TOKEN_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}