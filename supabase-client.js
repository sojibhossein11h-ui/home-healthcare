const SUPABASE_URL = "https://yxgwkfcmsussewogaosc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zvr4RSEtnUiWD5OvGtomgw_biYzP6vw";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.supabaseClient = supabaseClient;
