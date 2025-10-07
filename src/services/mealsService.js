import { supabase } from '../lib/supabase';

// Meals CRUD operations
export async function getMeals() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert snake_case to camelCase for frontend consistency
    const meals = (data || []).map(meal => ({
      ...meal,
      freezerPortions: meal.freezer_portions || 0
    }));

    console.log('Loaded meals with freezer portions:', meals);
    return meals;
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
}

export async function saveMeal(meal) {
  try {
    console.log('Attempting to save meal:', meal);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Not authenticated');
    }

    console.log('User authenticated:', user.id);

    const mealData = {
      user_id: user.id,
      title: meal.title,
      description: meal.description || null,
      image: meal.image || null,
      rating: meal.rating ? Number(meal.rating) : null,
      freezer_portions: Number(meal.freezerPortions || 0),
      updated_at: new Date().toISOString()
    };

    console.log('Original meal freezerPortions:', meal.freezerPortions);
    console.log('Converted freezer_portions for DB:', mealData.freezer_portions);

    // Only include ID for updates, not for new inserts
    if (meal.id) {
      mealData.id = meal.id;
    }

    console.log('Processed meal data for DB:', mealData);

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
      delete result.freezer_portions;
    }

    return result;
  } catch (error) {
    console.error('Error saving meal:', error);
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
      delete data.freezer_portions;
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
      await saveMeal(updatedMeal);
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

    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

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

    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    // First get the meal plan to check if it was from freezer
    const existingPlan = await getMealPlan(dateStr);

    // If the meal was from freezer, restore the freezer portion
    if (existingPlan && existingPlan.fromFreezer) {
      const mealToUpdate = { ...existingPlan.meal };
      mealToUpdate.freezerPortions = (mealToUpdate.freezerPortions || 0) + 1;
      await saveMeal(mealToUpdate);
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
  return monday.toISOString().split('T')[0];
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
      const { data: meals, error: mealsError } = await supabase
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
      const { data: events, error: eventsError } = await supabase
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