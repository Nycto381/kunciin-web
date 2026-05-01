import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdejtyncfrwcbtohwcth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZWp0eW5jZnJ3Y2J0b2h3Y3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjUwNDgsImV4cCI6MjA5MjYwMTA0OH0.GRiWGEXY-33vq1qF2Cys3VVVJEZ_37nBDxnVmRh8lzI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
