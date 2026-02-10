import { db } from '../lib/db';
import { queueSync } from './syncService';

// Snacks CRUD operations
export async function getSnacks() {
  try {
    const snacks = await db.snacks.toArray();
    // Sort by created_at descending
    snacks.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return snacks;
  } catch (error) {
    console.error('Error fetching snacks:', error);
    throw error;
  }
}

export async function saveSnack(snack) {
  try {
    const now = new Date().toISOString();

    const snackData = {
      id: snack.id || crypto.randomUUID(),
      title: snack.title,
      description: snack.description || null,
      image: snack.image || null,
      created_at: snack.created_at || now,
      updatedAt: now
    };

    await db.snacks.put(snackData);
    queueSync('snack', snackData.id, snack.id ? 'update' : 'create');

    return snackData;
  } catch (error) {
    console.error('Error saving snack:', error);
    throw error;
  }
}

export async function deleteSnack(snackId) {
  try {
    await db.snacks.delete(snackId);
    queueSync('snack', snackId, 'delete');
    return true;
  } catch (error) {
    console.error('Error deleting snack:', error);
    throw error;
  }
}

export async function getSnackById(snackId) {
  try {
    return await db.snacks.get(snackId) || null;
  } catch (error) {
    console.error('Error fetching snack:', error);
    throw error;
  }
}

// Database initialization - no-op for Dexie
export async function initDB() {
  return Promise.resolve();
}
