import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_AUTH_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

/**
 * 获取当前登录用户的 access_token
 * 用于向 Edge Function 发送认证请求
 * @returns {Promise<string | null>} 用户的 access_token，或 null 如果未登录
 */
export const getAccessToken = async (): Promise<string | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};
