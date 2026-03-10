import { createClient } from '@supabase/supabase-js';

// Replace these with the strings from your screenshots
const supabaseUrl = 'https://zvnlhanaqjsxszspvhpe.supabase.co';
const supabaseAnonKey = 'YOUR_PUBLISHABLE_KEY_FROM_SCREENSHOT'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);