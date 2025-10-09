import { supabase } from '../lib/supabase';

// Snacks CRUD operations
export async function getSnacks() {
  try {
    console.log('getSnacks called');

    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user for snacks:', user?.id);

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('snacks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('Snacks query result:', { data, error });

    if (error) {
      console.error('Supabase snacks query error:', error);
      throw error;
    }

    console.log('Loaded snacks:', (data || []).length, 'snacks');
    return data || [];
  } catch (error) {
    console.error('Error fetching snacks:', error);
    throw error;
  }
}

export async function saveSnack(snack) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const snackData = {
      user_id: user.id,
      title: snack.title,
      description: snack.description || null,
      image: snack.image || null,
      updated_at: new Date().toISOString()
    };

    // Only include ID for updates, not for new inserts
    if (snack.id) {
      snackData.id = snack.id;
    }

    let result;
    if (snack.id) {
      // Update existing snack
      const { data, error } = await supabase
        .from('snacks')
        .update(snackData)
        .eq('id', snack.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new snack
      snackData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('snacks')
        .insert([snackData])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error('Error saving snack:', error);
    throw error;
  }
}

export async function deleteSnack(snackId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('snacks')
      .delete()
      .eq('id', snackId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting snack:', error);
    throw error;
  }
}

export async function getSnackById(snackId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('snacks')
      .select('*')
      .eq('id', snackId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching snack:', error);
    throw error;
  }
}

// Database initialization (no-op for Supabase)
export async function initDB() {
  // Test if snacks table exists
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Promise.resolve();
    }

    const { error: snacksError } = await supabase
      .from('snacks')
      .select('count')
      .limit(1);

    if (snacksError) {
      console.error('Snacks table error:', snacksError);
    }
  } catch (error) {
    console.error('Error checking snacks table:', error);
  }

  return Promise.resolve();
}