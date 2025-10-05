const DB_NAME = 'MealPlannerDB';
const DB_VERSION = 2;
const MEALS_STORE = 'meals';
const PLANS_STORE = 'mealPlans';

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(MEALS_STORE)) {
        const mealsStore = database.createObjectStore(MEALS_STORE, { keyPath: 'id' });
        mealsStore.createIndex('title', 'title', { unique: false });
        mealsStore.createIndex('rating', 'rating', { unique: false });
      }

      if (!database.objectStoreNames.contains(PLANS_STORE)) {
        const plansStore = database.createObjectStore(PLANS_STORE, { keyPath: 'date' });
        plansStore.createIndex('week', 'weekKey', { unique: false });
      }
    };
  });
}

export async function getMeals() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEALS_STORE], 'readonly');
    const store = transaction.objectStore(MEALS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveMeal(meal) {
  if (!db) await initDB();

  const mealToSave = {
    ...meal,
    id: meal.id || generateId(),
    createdAt: meal.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEALS_STORE], 'readwrite');
    const store = transaction.objectStore(MEALS_STORE);
    const request = store.put(mealToSave);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(mealToSave);
  });
}

export async function deleteMeal(id) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEALS_STORE], 'readwrite');
    const store = transaction.objectStore(MEALS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export async function getMealById(id) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEALS_STORE], 'readonly');
    const store = transaction.objectStore(MEALS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Meal Plan functions
export async function saveMealPlan(date, meal, useFromFreezer = null) {
  if (!db) await initDB();

  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const weekKey = getWeekKey(dateStr);

  // Determine if we should use from freezer
  let fromFreezer = false;
  let updatedMeal = { ...meal };

  if (useFromFreezer === null) {
    // Auto-determine: use from freezer if portions available
    fromFreezer = meal.freezerPortions > 0;
  } else {
    fromFreezer = useFromFreezer;
  }

  // If using from freezer, reduce the freezer portions in the meal
  if (fromFreezer && meal.freezerPortions > 0) {
    updatedMeal.freezerPortions = meal.freezerPortions - 1;
    // Update the meal in the meals store
    await saveMeal(updatedMeal);
  }

  const mealPlan = {
    date: dateStr,
    meal: updatedMeal,
    fromFreezer: fromFreezer,
    weekKey: weekKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLANS_STORE], 'readwrite');
    const store = transaction.objectStore(PLANS_STORE);
    const request = store.put(mealPlan);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(mealPlan);
  });
}

export async function getMealPlan(date) {
  if (!db) await initDB();

  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLANS_STORE], 'readonly');
    const store = transaction.objectStore(PLANS_STORE);
    const request = store.get(dateStr);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getWeekMealPlans(weekKey) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLANS_STORE], 'readonly');
    const store = transaction.objectStore(PLANS_STORE);
    const index = store.index('week');
    const request = index.getAll(weekKey);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteMealPlan(date) {
  if (!db) await initDB();

  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  // First get the meal plan to check if it was from freezer
  const existingPlan = await getMealPlan(dateStr);

  return new Promise(async (resolve, reject) => {
    try {
      // If the meal was from freezer, restore the freezer portion
      if (existingPlan && existingPlan.fromFreezer) {
        const mealToUpdate = { ...existingPlan.meal };
        mealToUpdate.freezerPortions = (mealToUpdate.freezerPortions || 0) + 1;
        await saveMeal(mealToUpdate);
      }

      // Now delete the meal plan
      const transaction = db.transaction([PLANS_STORE], 'readwrite');
      const store = transaction.objectStore(PLANS_STORE);
      const request = store.delete(dateStr);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

// Utility functions
function getWeekKey(dateStr) {
  const date = new Date(dateStr);
  const monday = getMonday(date);
  return monday.toISOString().split('T')[0];
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}