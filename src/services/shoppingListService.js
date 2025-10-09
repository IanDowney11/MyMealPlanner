import { supabase } from '../lib/supabase';

// Frequent Items CRUD operations
export async function getFrequentItems() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('frequent_items')
      .select('*')
      .eq('user_id', user.id)
      .order('item_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching frequent items:', error);
    throw error;
  }
}

export async function addFrequentItem(itemName) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!itemName.trim()) {
      throw new Error('Item name cannot be empty');
    }

    const itemData = {
      user_id: user.id,
      item_name: itemName.trim()
    };

    const { data, error } = await supabase
      .from('frequent_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding frequent item:', error);
    throw error;
  }
}

export async function deleteFrequentItem(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('frequent_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting frequent item:', error);
    throw error;
  }
}

// Shopping List CRUD operations
export async function getCurrentShoppingList() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        shopping_list_items (*)
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    throw error;
  }
}

export async function createShoppingList(name = 'Shopping List') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const listData = {
      user_id: user.id,
      name: name.trim()
    };

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert([listData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
}

export async function deleteShoppingList(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
}

// Shopping List Items CRUD operations
export async function addItemToShoppingList(shoppingListId, itemName) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!itemName.trim()) {
      throw new Error('Item name cannot be empty');
    }

    const itemData = {
      shopping_list_id: shoppingListId,
      item_name: itemName.trim(),
      is_completed: false
    };

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    throw error;
  }
}

export async function toggleShoppingListItem(id, isCompleted) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shopping_list_items')
      .update({ is_completed: isCompleted })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling shopping list item:', error);
    throw error;
  }
}

export async function deleteShoppingListItem(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    throw error;
  }
}

// Legacy functions for backward compatibility
export async function getShoppingItems() {
  const shoppingList = await getCurrentShoppingList();
  return shoppingList?.shopping_list_items || [];
}

export async function addShoppingItem(itemName) {
  let shoppingList = await getCurrentShoppingList();

  if (!shoppingList) {
    shoppingList = await createShoppingList();
  }

  return await addItemToShoppingList(shoppingList.id, itemName);
}

export async function toggleShoppingItem(id, isCompleted) {
  return await toggleShoppingListItem(id, isCompleted);
}

export async function deleteShoppingItem(id) {
  return await deleteShoppingListItem(id);
}

export async function clearCompletedItems() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const shoppingList = await getCurrentShoppingList();
    if (!shoppingList) return true;

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('shopping_list_id', shoppingList.id)
      .eq('is_completed', true);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing completed items:', error);
    throw error;
  }
}

// Database initialization
export async function initDB() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Promise.resolve();
    }

    // Test if new tables exist
    const { error: tableError } = await supabase
      .from('frequent_items')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('Shopping list tables error:', tableError);
    }
  } catch (error) {
    console.error('Error checking shopping list tables:', error);
  }

  return Promise.resolve();
}