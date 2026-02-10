import { db } from '../lib/db';
import { queueSync } from './syncService';

// Frequent Items CRUD operations
export async function getFrequentItems() {
  try {
    const items = await db.frequentItems.toArray();
    // Sort in JS since indexed fields are encrypted
    items.sort((a, b) => (a.itemNameLower || '').localeCompare(b.itemNameLower || ''));
    // Add snake_case alias for UI compat
    return items.map(item => ({
      ...item,
      item_name: item.itemName
    }));
  } catch (error) {
    console.error('Error fetching frequent items:', error);
    throw error;
  }
}

export async function addFrequentItem(itemName) {
  try {
    if (!itemName.trim()) {
      throw new Error('Item name cannot be empty');
    }

    // Check for duplicates manually since unique index won't work on encrypted data
    const existing = await db.frequentItems.toArray();
    const duplicate = existing.find(i => (i.itemNameLower || '') === itemName.trim().toLowerCase());
    if (duplicate) {
      return duplicate;
    }

    const itemData = {
      id: crypto.randomUUID(),
      itemName: itemName.trim(),
      itemNameLower: itemName.trim().toLowerCase(),
      item_name: itemName.trim()
    };

    await db.frequentItems.put(itemData);
    queueSync('freqitems', 'all', 'update');
    return itemData;
  } catch (error) {
    console.error('Error adding frequent item:', error);
    throw error;
  }
}

export async function deleteFrequentItem(id) {
  try {
    await db.frequentItems.delete(id);
    queueSync('freqitems', 'all', 'update');
    return true;
  } catch (error) {
    console.error('Error deleting frequent item:', error);
    throw error;
  }
}

// Shopping List CRUD operations
export async function getCurrentShoppingList() {
  try {
    const list = await db.shoppingLists.toCollection().first();
    if (!list) return null;

    const items = await db.shoppingListItems
      .where('shoppingListId')
      .equals(list.id)
      .toArray();

    // Add snake_case aliases for UI compat
    const mappedItems = items.map(item => ({
      ...item,
      item_name: item.itemName,
      is_completed: item.isCompleted,
      shopping_list_id: item.shoppingListId
    }));

    return {
      ...list,
      shopping_list_items: mappedItems
    };
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    throw error;
  }
}

export async function createShoppingList(name = 'Shopping List') {
  try {
    const now = new Date().toISOString();
    const listData = {
      id: crypto.randomUUID(),
      name: name.trim(),
      created_at: now,
      updatedAt: now
    };

    await db.shoppingLists.put(listData);
    queueSync('shoplist', listData.id, 'create');
    return listData;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
}

export async function deleteShoppingList(id) {
  try {
    // Delete all items in the list
    await db.shoppingListItems.where('shoppingListId').equals(id).delete();
    await db.shoppingLists.delete(id);
    queueSync('shoplist', id, 'delete');
    return true;
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
}

// Shopping List Items CRUD operations
export async function addItemToShoppingList(shoppingListId, itemName) {
  try {
    if (!itemName.trim()) {
      throw new Error('Item name cannot be empty');
    }

    const itemData = {
      id: crypto.randomUUID(),
      shoppingListId: shoppingListId,
      itemName: itemName.trim(),
      isCompleted: false,
      // snake_case aliases for UI compat
      item_name: itemName.trim(),
      is_completed: false,
      shopping_list_id: shoppingListId
    };

    await db.shoppingListItems.put(itemData);
    queueSync('shoplist', shoppingListId, 'update');
    return itemData;
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    throw error;
  }
}

export async function toggleShoppingListItem(id, isCompleted) {
  try {
    const item = await db.shoppingListItems.get(id);
    if (!item) return null;

    const updated = {
      ...item,
      isCompleted,
      is_completed: isCompleted
    };

    await db.shoppingListItems.put(updated);
    queueSync('shoplist', item.shoppingListId, 'update');

    return {
      ...updated,
      item_name: updated.itemName,
      is_completed: updated.isCompleted,
      shopping_list_id: updated.shoppingListId
    };
  } catch (error) {
    console.error('Error toggling shopping list item:', error);
    throw error;
  }
}

export async function deleteShoppingListItem(id) {
  try {
    const item = await db.shoppingListItems.get(id);
    await db.shoppingListItems.delete(id);
    if (item) {
      queueSync('shoplist', item.shoppingListId, 'update');
    }
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
    const shoppingList = await getCurrentShoppingList();
    if (!shoppingList) return true;

    const completedItems = await db.shoppingListItems
      .where('shoppingListId')
      .equals(shoppingList.id)
      .filter(item => item.isCompleted)
      .toArray();

    for (const item of completedItems) {
      await db.shoppingListItems.delete(item.id);
    }

    queueSync('shoplist', shoppingList.id, 'update');
    return true;
  } catch (error) {
    console.error('Error clearing completed items:', error);
    throw error;
  }
}

// Database initialization - no-op for Dexie
export async function initDB() {
  return Promise.resolve();
}
