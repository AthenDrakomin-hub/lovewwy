
import { createClient } from '@supabase/supabase-js';

// Support for different environment variable formats (Vite vs standard Node)
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
