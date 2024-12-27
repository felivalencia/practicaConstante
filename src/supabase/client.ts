import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlfgvzkoicopplnjignh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZmd2emtvaWNvcHBsbmppZ25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNDkxNTksImV4cCI6MjA1MDgyNTE1OX0.dAKGWpNbKb5og8tUuc0R3TFIn58JWHRb7EKQkWPsmZg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);