
/**
 * SUPABASE CLIENT INITIALIZATION
 * Connects to Ksmart Ecosystem Database
 */

// TODO: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://tiroaypoxqqzjfjjizel.supabase.co';
// WARNING: This is the ANON key. It is safe to expose to the client ONLY if you have enabled
// Row Level Security (RLS) on your Supabase tables. Do NOT use the SERVICE_ROLE key here.
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcm9heXBveHFxempmamppemVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMzc1NDEsImV4cCI6MjA4MjgxMzU0MX0.dTr_uBOsZ2B6Dq1OGLsLv51r03eSBggu0h4y_FnapxA';

// Check if supabase-js is loaded (from CDN)
if (typeof supabase === 'undefined') {
    console.error('Supabase JS SDK not loaded! Please check index.html');
}

// Initialize Client with persistence enabled
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Export for use in other files
window.supabaseClient = _supabase;
