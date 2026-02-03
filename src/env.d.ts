/// <reference types="vite/client" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NEXT_PUBLIC_S3_PUBLIC_BASE_URL?: string;
      readonly NEXT_PUBLIC_SUPABASE_S3_ENDPOINT?: string;
      readonly NEXT_PUBLIC_SUPABASE_S3_REGION?: string;
      readonly NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID?: string;
      readonly NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY?: string;
      readonly NEXT_PUBLIC_SUPABASE_S3_BUCKET?: string;
      readonly NEXT_PUBLIC_SUPABASE_AUTH_URL?: string;
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
      readonly NEXT_PUBLIC_FUNCTIONS_URL?: string;
      readonly NEXT_PUBLIC_PAYMENT_API_URL?: string;
      readonly PAYMENT_API_URL?: string; // server-side payment API base URL
      readonly SUPABASE_SERVICE_ROLE_KEY?: string; // supabase service role key for server actions
      readonly DATABASE_URL?: string; // optional Postgres URL for direct DB writes
      readonly MIGRATE_SECRET?: string; // secret to protect admin endpoints
      readonly PASSWORD_HASH?: string;
      readonly TEMP_TOKEN_SECRET?: string;
    }
  }
}

export {};
