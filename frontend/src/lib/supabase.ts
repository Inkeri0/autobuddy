import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://onzllnshvfarlzyyejsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uemxsbnNodmZhcmx6eXllanN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODkyNTIsImV4cCI6MjA4NjA2NTI1Mn0.WNgUZw1HpjhXGJjeMdvWRO49WyeE0lJmga1cV77YEYo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
