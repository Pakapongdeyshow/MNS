import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_URL = 'https://iwcwsvvrwijllxijnbdj.supabase.co';
const DEFAULT_KEY_B64 = 'c2Jfc2VjcmV0X2pyb3lvdEZlQzlrQkZyYVd3eEcyb2dfSDc4ZFp6eTc=';
const fallbackKey = Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf8');

export const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_URL;
export const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || fallbackKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
