import { supabase } from '../lib/supabase';

// Snacks CRUD operations
export async function getSnacks() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('snacks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Loaded snacks:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching snacks:', error);
    throw error;
  }
}

export async function saveSnack(snack) {
  try {
    console.log('Attempting to save snack:', snack);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Not authenticated');
    }

    console.log('User authenticated:', user.id);

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

    console.log('Processed snack data for DB:', snackData);

    let result;
    if (snack.id) {
      // Update existing snack
      console.log('Updating existing snack with ID:', snack.id);
      const { data, error } = await supabase
        .from('snacks')
        .update(snackData)
        .eq('id', snack.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      result = data;
    } else {
      // Create new snack
      console.log('Creating new snack');
      snackData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('snacks')
        .insert([snackData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      result = data;
    }

    console.log('Supabase operation successful:', result);
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
      console.log('No authenticated user for snacks table check');
      return Promise.resolve();
    }

    console.log('Testing snacks table...');

    const { data: snacks, error: snacksError } = await supabase
      .from('snacks')
      .select('count')
      .limit(1);

    if (snacksError) {
      console.error('Snacks table error:', snacksError);
      console.log('❌ Please create the snacks table in Supabase using the provided SQL');
    } else {
      console.log('✅ Snacks table exists');
    }
  } catch (error) {
    console.error('Error checking snacks table:', error);
  }

  return Promise.resolve();
}