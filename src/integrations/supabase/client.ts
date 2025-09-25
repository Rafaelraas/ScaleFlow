import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttgntuaffrondfxybxmi.supabase.co'
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z250dWFmZnJvbmRmeHlieG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExMzksImV4cCI6MjA3NDMzNzEzOX0.TiF3qvuTqMOicjVboGgtIY2nBM5da56sxWDv11Bg1Xk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);