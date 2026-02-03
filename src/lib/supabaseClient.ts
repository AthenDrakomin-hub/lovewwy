import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // During build-time or in environments without env vars we avoid creating the client
  // to prevent failing the build. Any runtime use should check `supabase` for null.
  supabase = null;
}

/**
 * 获取当前登录用户的 access_token
 * 用于向 Edge Function 发送认证请求
 * @returns {Promise<string | null>} 用户的 access_token，或 null 如果未登录
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};
