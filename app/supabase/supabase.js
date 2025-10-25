
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://eqfzoeaqzkzohesuinqo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxZnpvZWFxemt6b2hlc3VpbnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTQwNTMsImV4cCI6MjA3MjE5MDA1M30.tRc8g3Hs834hyHmCB5wTm93uJSitO-NiU9y4dmljNZY'
export const supabase = createClient(supabaseUrl, supabaseKey)