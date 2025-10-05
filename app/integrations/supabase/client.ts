import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ddnusmdallxgzfweewuq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbnVzbWRhbGx4Z3pmd2Vld3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU4MzYsImV4cCI6MjA3NTE3MTgzNn0.UC1shGjdK_ZjAEhWH2StmByMcx0VDBMO0MBGHN5sj0M";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
