import { supabase } from '../lib/supabase';

// Helper function to format date in local timezone (not UTC)
// This prevents timezone offset issues where dates might shift by a day
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Meals CRUD operations
export async function getMeals(sortBy = 'created_at', sortOrder = 'desc') {
  try {
    console.log('getMeals called with sortBy:', sortBy, 'sortOrder:', sortOrder);

    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);

    if (!user) throw new Error('Not authenticated');

    // Map frontend sort fields to database columns
    const sortFieldMap = {
      'created_at': 'created_at',
      'title': 'title',
      'rating': 'rating',
      'lastEaten': 'last_eaten',
      'eatenCount': 'eaten_count'
    };

    const dbSortField = sortFieldMap[sortBy] || 'created_at';
    const ascending = sortOrder === 'asc';

    console.log('Querying meals table with field:', dbSortField, 'ascending:', ascending);

    let query = supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id);

    // For last_eaten, we need to handle null values properly
    if (dbSortField === 'last_eaten') {
      query = query.order('last_eaten', { ascending, nullsFirst: !ascending });
    } else {
      query = query.order(dbSortField, { ascending });
    }

    const { data, error } = await query;

    console.log('Supabase query result:', { data, error });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Convert snake_case to camelCase for frontend consistency
    const meals = (data || []).map(meal => ({
      ...meal,
      freezerPortions: meal.freezer_portions || 0,
      lastEaten: meal.last_eaten,
      eatenCount: meal.eaten_count || 0,
      recipeUrl: meal.recipe_url,
      tags: meal.tags || []
    }));

    console.log('Loaded meals with tracking data:', meals.length, 'meals');
    return meals;
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
}

export async function saveMeal(meal) {
  try {
    console.log('saveMeal called with:', meal);

    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user for save:', user?.id);

    if (!user) throw new Error('Not authenticated');

    const mealData = {
      user_id: user.id,
      title: meal.title,
      description: meal.description || null,
      image: meal.image || null,
      rating: meal.rating ? Number(meal.rating) : null,
      freezer_portions: Number(meal.freezerPortions || 0),
      versions: meal.versions || [],
      recipe_url: meal.recipeUrl || null,
      tags: meal.tags || [],
      updated_at: new Date().toISOString()
    };

    console.log('Meal data to save:', mealData);

    // Only include ID for updates, not for new inserts
    if (meal.id) {
      mealData.id = meal.id;
    }

    let result;
    if (meal.id) {
      // Update existing meal
      console.log('Updating existing meal with ID:', meal.id);
      const { data, error } = await supabase
        .from('meals')
        .update(mealData)
        .eq('id', meal.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      result = data;
    } else {
      // Create new meal
      console.log('Creating new meal');
      mealData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('meals')
        .insert([mealData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      result = data;
    }

    console.log('Supabase operation successful:', result);

    // Convert snake_case back to camelCase for frontend consistency
    if (result) {
      result.freezerPortions = result.freezer_portions;
      result.lastEaten = result.last_eaten;
      result.eatenCount = result.eaten_count || 0;
      result.recipeUrl = result.recipe_url;
      result.tags = result.tags || [];
      delete result.freezer_portions;
      delete result.last_eaten;
      delete result.eaten_count;
      delete result.recipe_url;
    }

    return result;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}

export async function markMealAsEaten(mealId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current meal data to increment eaten count
    const currentMeal = await getMealById(mealId);
    if (!currentMeal) throw new Error('Meal not found');

    const updateData = {
      last_eaten: new Date().toISOString(),
      eaten_count: (currentMeal.eatenCount || 0) + 1,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('meals')
      .update(updateData)
      .eq('id', mealId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Convert snake_case back to camelCase for frontend consistency
    if (data) {
      data.freezerPortions = data.freezer_portions;
      data.lastEaten = data.last_eaten;
      data.eatenCount = data.eaten_count || 0;
      data.recipeUrl = data.recipe_url;
      data.tags = data.tags || [];
      delete data.freezer_portions;
      delete data.last_eaten;
      delete data.eaten_count;
      delete data.recipe_url;
    }

    return data;
  } catch (error) {
    console.error('Error marking meal as eaten:', error);
    throw error;
  }
}

export async function deleteMeal(mealId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

export async function getMealById(mealId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', mealId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    // Convert snake_case to camelCase for frontend consistency
    if (data) {
      data.freezerPortions = data.freezer_portions;
      data.lastEaten = data.last_eaten;
      data.eatenCount = data.eaten_count || 0;
      data.recipeUrl = data.recipe_url;
      data.tags = data.tags || [];
      delete data.freezer_portions;
      delete data.last_eaten;
      delete data.eaten_count;
      delete data.recipe_url;
    }

    return data;
  } catch (error) {
    console.error('Error fetching meal:', error);
    throw error;
  }
}

// Meal Plans CRUD operations
export async function saveMealPlan(date, meal, useFromFreezer = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dateStr = typeof date === 'string' ? date : formatLocalDate(date);
    const weekKey = getWeekKey(dateStr);

    // Check if this is a past date and automatically mark as eaten
    const today = formatLocalDate(new Date());
    const isPastDate = dateStr < today;

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
      await saveMeal(updatedMeal);
    }

    // If planning a meal for a past date, mark it as eaten
    if (isPastDate) {
      await markMealAsEaten(meal.id);
      // Refresh meal data to get updated eaten count
      updatedMeal = await getMealById(meal.id);
    }

    const mealPlanData = {
      date: dateStr,
      user_id: user.id,
      meal_id: updatedMeal.id,
      meal_data: updatedMeal, // Store meal data as JSON
      from_freezer: fromFreezer,
      week_key: weekKey,
      updated_at: new Date().toISOString()
    };

    // Check if meal plan already exists for this date
    const { data: existing } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .single();

    let result;
    if (existing) {
      // Update existing meal plan
      const { data, error } = await supabase
        .from('meal_plans')
        .update(mealPlanData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new meal plan
      mealPlanData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([mealPlanData])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Return in the format expected by the frontend
    return {
      date: result.date,
      meal: result.meal_data,
      fromFreezer: result.from_freezer,
      weekKey: result.week_key,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };

  } catch (error) {
    console.error('Error saving meal plan:', error);
    throw error;
  }
}

export async function getMealPlan(date) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dateStr = typeof date === 'string' ? date : formatLocalDate(date);

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found, which is OK

    if (!data) return null;

    // Return in the format expected by the frontend
    return {
      date: data.date,
      meal: data.meal_data,
      fromFreezer: data.from_freezer,
      weekKey: data.week_key,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

  } catch (error) {
    console.error('Error fetching meal plan:', error);
    throw error;
  }
}

export async function getWeekMealPlans(weekKey) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_key', weekKey);

    if (error) throw error;

    // Convert to frontend format
    return (data || []).map(item => ({
      date: item.date,
      meal: item.meal_data,
      fromFreezer: item.from_freezer,
      weekKey: item.week_key,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

  } catch (error) {
    console.error('Error fetching week meal plans:', error);
    throw error;
  }
}

export async function deleteMealPlan(date) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dateStr = typeof date === 'string' ? date : formatLocalDate(date);

    // First get the meal plan to check if it was from freezer
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

      // Get current meal data
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .select('eaten_count')
        .eq('id', mealId)
        .eq('user_id', user.id)
        .single();

      if (!mealError && mealData) {
        const currentCount = mealData.eaten_count || 0;
        const newCount = Math.max(0, currentCount - 1); // Don't go below 0

        // Update the eaten count
        const { error: updateError } = await supabase
          .from('meals')
          .update({
            eaten_count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', mealId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating eaten count on meal removal:', updateError);
        } else {
          console.log(`Decreased eaten count for meal ${mealId}: ${currentCount} -> ${newCount}`);
        }
      }
    }

    // Delete the meal plan
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('user_id', user.id)
      .eq('date', dateStr);

    if (error) throw error;
    return true;

  } catch (error) {
    console.error('Error deleting meal plan:', error);
    throw error;
  }
}

// Utility functions
function getWeekKey(dateStr) {
  const date = new Date(dateStr);
  const monday = getMonday(date);
  return formatLocalDate(monday);
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Database initialization and diagnostics
export async function initDB() {
  // Test Supabase connection and tables
  try {
    console.log('Testing Supabase connection...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user');
      return Promise.resolve();
    }

    console.log('User authenticated:', user.email);

    // Test if tables exist by querying them
    try {
      const { error: mealsError } = await supabase
        .from('meals')
        .select('count')
        .limit(1);

      if (mealsError) {
        console.error('Meals table error:', mealsError);
        console.log('❌ Please create the meals table in Supabase using the provided SQL');
      } else {
        console.log('✅ Meals table exists');
      }
    } catch (e) {
      console.error('Error checking meals table:', e);
    }

    try {
      const { error: eventsError } = await supabase
        .from('events')
        .select('count')
        .limit(1);

      if (eventsError) {
        console.error('Events table error:', eventsError);
        console.log('❌ Please create the events table in Supabase using the provided SQL');
      } else {
        console.log('✅ Events table exists');
      }
    } catch (e) {
      console.error('Error checking events table:', e);
    }

  } catch (error) {
    console.error('Supabase connection test failed:', error);
  }

  return Promise.resolve();
}

// Copy last week's meal plans to current week
export async function copyLastWeekMealPlans(currentWeekKey) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Copying last week meals for week:', currentWeekKey);

    // Calculate last week's key (7 days ago)
    const currentMondayDate = new Date(currentWeekKey);
    const lastMondayDate = new Date(currentMondayDate);
    lastMondayDate.setDate(lastMondayDate.getDate() - 7);
    const lastWeekKey = formatLocalDate(lastMondayDate);

    console.log('Last week key:', lastWeekKey);

    // Get last week's meal plans
    const lastWeekPlans = await getWeekMealPlans(lastWeekKey);

    if (lastWeekPlans.length === 0) {
      throw new Error('No meals found in last week to copy');
    }

    console.log('Found', lastWeekPlans.length, 'meals from last week');

    // Delete any existing meal plans for current week first
    const { error: deleteError } = await supabase
      .from('meal_plans')
      .delete()
      .eq('user_id', user.id)
      .eq('week_key', currentWeekKey);

    if (deleteError) {
      console.error('Error clearing current week:', deleteError);
      throw deleteError;
    }

    // Create new meal plans for current week
    const newMealPlans = [];
    const mealTrackingUpdates = new Map(); // Track which meals to update

    for (const plan of lastWeekPlans) {
      // Calculate the corresponding date in current week
      const lastWeekDate = new Date(plan.date);
      const dayOfWeek = lastWeekDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0 system

      const newDate = new Date(currentWeekKey);
      newDate.setDate(newDate.getDate() + mondayOffset);
      const newDateStr = formatLocalDate(newDate);

      const newPlan = {
        user_id: user.id,
        date: newDateStr,
        week_key: currentWeekKey,
        meal_id: plan.meal_id,
        meal_data: plan.meal_data || plan.meal, // Include the full meal data
        selected_version: plan.selected_version,
        from_freezer: plan.from_freezer || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      newMealPlans.push(newPlan);

      // Track meal for updating eaten count and last eaten date
      const mealId = plan.meal_id || plan.meal?.id;
      if (mealId && !mealTrackingUpdates.has(mealId)) {
        mealTrackingUpdates.set(mealId, {
          meal_id: mealId,
          dates: []
        });
      }
      if (mealId) {
        mealTrackingUpdates.get(mealId).dates.push(newDateStr);
      }
    }

    // Insert all new meal plans
    const { data: insertedPlans, error: insertError } = await supabase
      .from('meal_plans')
      .insert(newMealPlans)
      .select();

    if (insertError) {
      console.error('Error inserting new meal plans:', insertError);
      throw insertError;
    }

    console.log('Successfully copied', insertedPlans.length, 'meal plans');

    // Update meal tracking data (eaten count and last eaten date)
    for (const [mealId, trackingData] of mealTrackingUpdates) {
      try {
        // Get current meal data
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .select('eaten_count, last_eaten')
          .eq('id', mealId)
          .eq('user_id', user.id)
          .single();

        if (mealError) {
          console.error('Error getting meal data for tracking:', mealError);
          continue;
        }

        // Find the most recent date for this meal
        const mostRecentDate = trackingData.dates.sort().pop();
        const newEatenCount = (mealData.eaten_count || 0) + trackingData.dates.length;

        // Update meal tracking
        const { error: updateError } = await supabase
          .from('meals')
          .update({
            eaten_count: newEatenCount,
            last_eaten: mostRecentDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', mealId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating meal tracking:', updateError);
        } else {
          console.log(`Updated meal ${mealId}: eaten_count=${newEatenCount}, last_eaten=${mostRecentDate}`);
        }
      } catch (error) {
        console.error('Error updating tracking for meal:', mealId, error);
      }
    }

    return insertedPlans;

  } catch (error) {
    console.error('Error copying last week meal plans:', error);
    throw error;
  }
}