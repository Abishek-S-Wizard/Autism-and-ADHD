import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wifujyooibxsrjvdjpvu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnVqeW9vaWJ4c3JqdmRqcHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTAyNjgsImV4cCI6MjA4ODk2NjI2OH0.ZHPvMQmT2HXs3as20hZy2eZneTLFCJRbf7LJt2ukSqY";

export const supabase = createClient(supabaseUrl, supabaseKey);
