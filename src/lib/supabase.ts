import { createClient } from '@supabase/supabase-js';

export function getSupabaseUrl(): string {
  // 1. 瀏覽器端執行：動態適應當前訪問的主機位址
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const protocol = window.location.protocol || 'http:';
    const host = window.location.hostname;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const parsed = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL, window.location.origin);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          parsed.hostname = host;
          parsed.protocol = protocol;
        }
        return parsed.origin;
      } catch {
        // fallback
      }
    }
    return `${protocol}//${host}:54321`;
  }

  // 2. SSR / 伺服端渲染環境
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
  }
  return 'http://127.0.0.1:54321';
}

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk4Mzg0MDAsImV4cCI6MTk2NTQxNDQwMH0.BBNqzGlFhYr_V_xPn8sflLd1m_9xoF_yY6k25vC4M2M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

