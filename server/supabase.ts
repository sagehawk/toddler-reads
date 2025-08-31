import { createClient } from '@supabase/supabase-js'

// These variables are being loaded by the `-r dotenv/config` flag in your package.json
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("CRITICAL ERROR: Server-side Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not loaded. Check your .env file.");
}

// Note: For server-side operations that require admin privileges,
// you would use the SUPABASE_SERVICE_ROLE_KEY. For user creation via signUp,
// the anon key is appropriate.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
