import { db } from '../lib/db';
import { getUserTimezone, formatDateInUserTimezone, getTodayInUserTimezone } from './timezoneService';
import { queueSync } from './syncService';

// Meals CRUD operations
export async function getMeals(sortBy = 'created_at', sortOrder = 'desc') {
  try {
    let meals = await db.meals.toArray();

    const sortFieldMap = {
      'created_at': 'created_at',
      'title': 'title',
      'rating': 'rating',
      'lastEaten': 'lastEaten',
      'eatenCount': 'eatenCount'
    };

    const field = sortFieldMap[sortBy] || 'created_at';
    const ascending = sortOrder === 'asc';

    meals.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      // Handle nulls
      if (valA == null && valB == null) return 0;
      if (valA == null) return ascending ? -1 : 1;
      if (valB == null) return ascending ? 1 : -1;

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    // Ensure all meals have expected properties
    return meals.map(meal => ({
      ...meal,
      freezerPortions: meal.freezerPortions || 0,
      eatenCount: meal.eatenCount || 0,
      tags: meal.tags || []
    }));
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
}

export async function saveMeal(meal) {
  try {
    const now = new Date().toISOString();

    const mealData = {
      id: meal.id || crypto.randomUUID(),
      title: meal.title,
      description: meal.description || null,
      image: meal.image || null,
      rating: meal.rating ? Number(meal.rating) : null,
      freezerPortions: Number(meal.freezerPortions || 0),
      versions: meal.versions || [],
      recipeUrl: meal.recipeUrl || null,
      tags: meal.tags || [],
      lastEaten: meal.lastEaten || null,
      eatenCount: meal.eatenCount || 0,
      created_at: meal.created_at || now,
      updatedAt: now
    };

    await db.meals.put(mealData);
    queueSync('meal', mealData.id, meal.id ? 'update' : 'create');

    return mealData;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}

export async function markMealAsEaten(mealId) {
  try {
    const currentMeal = await getMealById(mealId);
    if (!currentMeal) throw new Error('Meal not found');

    const now = new Date().toISOString();
    const updateData = {
      lastEaten: now,
      eatenCount: (currentMeal.eatenCount || 0) + 1,
      updatedAt: now
    };

    await db.meals.put({ ...currentMeal, ...updateData });
    queueSync('meal', mealId, 'update');

    return { ...currentMeal, ...updateData };
  } catch (error) {
    console.error('Error marking meal as eaten:', error);
    throw error;
  }
}

export async function deleteMeal(mealId) {
  try {
    await db.meals.delete(mealId);
    queueSync('meal', mealId, 'delete');
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

export async function getMealById(mealId) {
  try {
    const meal = await db.meals.get(mealId);
    if (!meal) return null;

    return {
      ...meal,
      freezerPortions: meal.freezerPortions || 0,
      eatenCount: meal.eatenCount || 0,
      tags: meal.tags || []
    };
  } catch (error) {
    console.error('Error fetching meal:', error);
    throw error;
  }
}

// Meal Plans CRUD operations
export async function saveMealPlan(date, meal, useFromFreezer = null) {
  try {
    const dateStr = typeof date === 'string' ? date : await formatDateInUserTimezone(date);
    const weekKey = await getWeekKey(dateStr);

    const today = await getTodayInUserTimezone();
    const isPastDate = dateStr < today;

    let fromFreezer = false;
    let updatedMeal = { ...meal };

    if (useFromFreezer === null) {
      fromFreezer = meal.freezerPortions > 0;
    } else {
      fromFreezer = useFromFreezer;
    }

    if (fromFreezer && meal.freezerPortions > 0) {
      updatedMeal.freezerPortions = meal.freezerPortions - 1;
      await saveMeal(updatedMeal);
    }

    if (isPastDate) {
      await markMealAsEaten(meal.id);
      updatedMeal = await getMealById(meal.id);
    }

    // Check if meal plan already exists for this date
    const allPlans = await db.mealPlans.toArray();
    const existing = allPlans.find(p => p.date === dateStr) || null;

    const now = new Date().toISOString();
    const mealPlanData = {
      id: existing?.id || crypto.randomUUID(),
      date: dateStr,
      meal_id: updatedMeal.id,
      meal_data: updatedMeal,
      fromFreezer: fromFreezer,
      weekKey: weekKey,
      created_at: existing?.created_at || now,
      updatedAt: now
    };

    await db.mealPlans.put(mealPlanData);
    queueSync('plan', mealPlanData.id, existing ? 'update' : 'create');

    return {
      date: mealPlanData.date,
      meal: mealPlanData.meal_data,
      fromFreezer: mealPlanData.fromFreezer,
      weekKey: mealPlanData.weekKey,
      createdAt: mealPlanData.created_at,
      updatedAt: mealPlanData.updatedAt
    };
  } catch (error) {
    console.error('Error saving meal plan:', error);
    throw error;
  }
}

export async function getMealPlan(date) {
  try {
    const dateStr = typeof date === 'string' ? date : await formatDateInUserTimezone(date);
    const allPlans = await db.mealPlans.toArray();
    const plan = allPlans.find(p => p.date === dateStr) || null;

    if (!plan) return null;

    return {
      date: plan.date,
      meal: plan.meal_data,
      fromFreezer: plan.fromFreezer,
      weekKey: plan.weekKey,
      createdAt: plan.created_at,
      updatedAt: plan.updatedAt
    };
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    throw error;
  }
}

export async function getWeekMealPlans(weekKey) {
  try {
    const allPlans = await db.mealPlans.toArray();
    const plans = allPlans.filter(p => p.weekKey === weekKey);

    return plans.map(item => ({
      date: item.date,
      meal: item.meal_data,
      meal_id: item.meal_id,
      meal_data: item.meal_data,
      fromFreezer: item.fromFreezer,
      from_freezer: item.fromFreezer,
      weekKey: item.weekKey,
      selected_version: item.selected_version,
      createdAt: item.created_at,
      updatedAt: item.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching week meal plans:', error);
    throw error;
  }
}

export async function deleteMealPlan(date) {
  try {
    const dateStr = typeof date === 'string' ? date : await formatDateInUserTimezone(date);

    const existingPlan = await getMealPlan(dateStr);

    // If the meal was from freezer, restore the freezer portion
    if (existingPlan && existingPlan.fromFreezer) {
      const mealToUpdate = { ...existingPlan.meal };
      mealToUpdate.freezerPortions = (mealToUpdate.freezerPortions || 0) + 1;
      await saveMeal(mealToUpdate);
    }

    // Decrease eaten count for the meal
    if (existingPlan && existingPlan.meal) {
      const mealId = existingPlan.meal.id;
      const mealData = await db.meals.get(mealId);

      if (mealData) {
        const currentCount = mealData.eatenCount || 0;
        const newCount = Math.max(0, currentCount - 1);

        await db.meals.put({
          ...mealData,
          eatenCount: newCount,
          updatedAt: new Date().toISOString()
        });
        queueSync('meal', mealId, 'update');
      }
    }

    // Delete the meal plan
    const deletePlans = await db.mealPlans.toArray();
    const plan = deletePlans.find(p => p.date === dateStr) || null;
    if (plan) {
      await db.mealPlans.delete(plan.id);
      queueSync('plan', plan.id, 'delete');
    }

    return true;
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    throw error;
  }
}

// Utility functions

async function getMonday(dateStr) {
  // Parse the YYYY-MM-DD date string and find the Monday of that week
  // Work entirely with date strings to avoid timezone shifting issues
  const [year, month, day] = dateStr.split('-').map(Number);

  // Create a date at noon to avoid DST edge cases
  const date = new Date(year, month - 1, day, 12, 0, 0);

  // getDay() is fine here since we constructed the date from local components
  const dayOfWeek = date.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(date);
  monday.setDate(monday.getDate() - daysToSubtract);

  // Extract year/month/day directly from the local Date object
  // (safe because we constructed it from local components, not UTC)
  const mYear = monday.getFullYear();
  const mMonth = String(monday.getMonth() + 1).padStart(2, '0');
  const mDay = String(monday.getDate()).padStart(2, '0');
  return `${mYear}-${mMonth}-${mDay}`;
}

async function getWeekKey(dateStr) {
  return getMonday(dateStr);
}

// Database initialization - no-op for Dexie (auto-initialized)
export async function initDB() {
  return Promise.resolve();
}

// Copy last week's meal plans to current week
export async function copyLastWeekMealPlans(currentWeekKey) {
  try {
    const [year, month, day] = currentWeekKey.split('-').map(Number);
    const currentMondayDate = new Date(year, month - 1, day, 12, 0, 0);
    const lastMondayDate = new Date(currentMondayDate);
    lastMondayDate.setDate(lastMondayDate.getDate() - 7);
    const lastWeekKey = await formatDateInUserTimezone(lastMondayDate);

    const lastWeekPlans = await getWeekMealPlans(lastWeekKey);

    if (lastWeekPlans.length === 0) {
      throw new Error('No meals found in last week to copy');
    }

    // Delete any existing meal plans for current week first
    const allExistingPlans = await db.mealPlans.toArray();
    const existingPlans = allExistingPlans.filter(p => p.weekKey === currentWeekKey);
    for (const plan of existingPlans) {
      await db.mealPlans.delete(plan.id);
      queueSync('plan', plan.id, 'delete');
    }

    const newMealPlans = [];
    const mealTrackingUpdates = new Map();

    for (const plan of lastWeekPlans) {
      const [lastYear, lastMonth, lastDay] = plan.date.split('-').map(Number);
      const lastWeekDate = new Date(lastYear, lastMonth - 1, lastDay, 12, 0, 0);
      const dayOfWeek = lastWeekDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const [currYear, currMonth, currDay] = currentWeekKey.split('-').map(Number);
      const newDate = new Date(currYear, currMonth - 1, currDay, 12, 0, 0);
      newDate.setDate(newDate.getDate() + mondayOffset);
      const newDateStr = await formatDateInUserTimezone(newDate);

      const now = new Date().toISOString();
      const newPlan = {
        id: crypto.randomUUID(),
        date: newDateStr,
        weekKey: currentWeekKey,
        meal_id: plan.meal_id || plan.meal?.id,
        meal_data: plan.meal_data || plan.meal,
        selected_version: plan.selected_version,
        fromFreezer: plan.fromFreezer || plan.from_freezer || false,
        created_at: now,
        updatedAt: now
      };

      newMealPlans.push(newPlan);

      const mealId = plan.meal_id || plan.meal?.id;
      if (mealId && !mealTrackingUpdates.has(mealId)) {
        mealTrackingUpdates.set(mealId, { dates: [] });
      }
      if (mealId) {
        mealTrackingUpdates.get(mealId).dates.push(newDateStr);
      }
    }

    // Insert all new meal plans
    await db.mealPlans.bulkPut(newMealPlans);
    for (const plan of newMealPlans) {
      queueSync('plan', plan.id, 'create');
    }

    // Update meal tracking data
    for (const [mealId, trackingData] of mealTrackingUpdates) {
      try {
        const mealData = await db.meals.get(mealId);
        if (!mealData) continue;

        const mostRecentDate = trackingData.dates.sort().pop();
        const newEatenCount = (mealData.eatenCount || 0) + trackingData.dates.length;

        await db.meals.put({
          ...mealData,
          eatenCount: newEatenCount,
          lastEaten: mostRecentDate,
          updatedAt: new Date().toISOString()
        });
        queueSync('meal', mealId, 'update');
      } catch (error) {
        console.error('Error updating tracking for meal:', mealId, error);
      }
    }

    return newMealPlans;
  } catch (error) {
    console.error('Error copying last week meal plans:', error);
    throw error;
  }
}
