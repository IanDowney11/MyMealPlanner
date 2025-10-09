import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');

  console.log('Environment variables:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

  try {
    // Test basic connection
    const { data, error } = await supabase.from('meals').select('count', { count: 'exact', head: true });
    console.log('Basic query test:', { data, error });

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { user: user?.id, authError });

    // Test if we can access the database at all
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    console.log('Tables test:', { tablesData, tablesError });

  } catch (error) {
    console.error('Connection test failed:', error);
  }
}