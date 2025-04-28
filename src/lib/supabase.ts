
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// This is a placeholder URL and key - once Supabase is connected via the Lovable integration 
// these will be replaced by the actual values from the environment
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
