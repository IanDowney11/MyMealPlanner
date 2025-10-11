import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Supabase client with service role for server-side access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Helper function to get tomorrow's date in YYYY-MM-DD format
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Helper function to format meal response
function formatMealResponse(mealData) {
  if (!mealData || !mealData.meal) {
    return null;
  }

  return {
    title: mealData.meal.title || 'Untitled Meal',
    description: mealData.meal.description || '',
    rating: mealData.meal.rating || 0,
    image: mealData.meal.image || '',
    tags: mealData.meal.tags || [],
    versions: mealData.meal.versions || []
  };
}

// Helper function to get meal for a specific date
async function getMealForDate(date, userId) {
  try {
    console.log(`Fetching meal for ${date}, user: ${userId}`);

    // Validate inputs
    if (!date || !userId) {
      console.error('Invalid date or userId provided');
      return null;
    }

    // Get meal plan for the specific date
    const { data: mealPlans, error: mealPlansError } = await supabase
      .from('meal_plans')
      .select('meal_data')
      .eq('user_id', userId)
      .eq('date', date)
      .limit(1);

    if (mealPlansError) {
      console.error('Database error:', mealPlansError);
      throw mealPlansError;
    }

    // Get the first meal plan for the date
    const mealPlan = mealPlans?.[0];

    if (!mealPlan?.meal_data) {
      console.log(`No meal found for ${date}`);
      return null;
    }

    console.log(`Meal found for ${date}: ${mealPlan.meal_data.title}`);

    return {
      date,
      meal: mealPlan.meal_data
    };
  } catch (error) {
    console.error('Error fetching meal:', error);
    return null;
  }
}

// API Routes

// GET /api/meals/tonight - Returns tonight's planned meal
app.get('/api/meals/tonight', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const today = getTodayDate();
    const mealData = await getMealForDate(today, userId);

    if (!mealData) {
      return res.status(404).json({
        message: 'No meal planned for tonight',
        date: today
      });
    }

    const formattedMeal = formatMealResponse(mealData);

    res.json({
      date: today,
      meal: formattedMeal
    });
  } catch (error) {
    console.error('Error fetching tonight\'s meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/meals/tomorrow - Returns tomorrow's planned meal
app.get('/api/meals/tomorrow', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const tomorrow = getTomorrowDate();
    const mealData = await getMealForDate(tomorrow, userId);

    if (!mealData) {
      return res.status(404).json({
        message: 'No meal planned for tomorrow',
        date: tomorrow
      });
    }

    const formattedMeal = formatMealResponse(mealData);

    res.json({
      date: tomorrow,
      meal: formattedMeal
    });
  } catch (error) {
    console.error('Error fetching tomorrow\'s meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to list recent meal plans for a user (production ready)
app.get('/api/debug/mealplans', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    // Get recent meal plans
    const { data: recentMealPlans, error } = await supabase
      .from('meal_plans')
      .select('date, meal_data')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const today = getTodayDate();
    const todayMeal = recentMealPlans?.find(plan => plan.date === today);

    res.json({
      userId,
      today,
      todayMealExists: !!todayMeal,
      totalMealPlans: recentMealPlans?.length || 0,
      recentMealPlans: recentMealPlans?.map(plan => ({
        date: plan.date,
        title: plan.meal_data?.title || 'Untitled'
      })) || []
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Meal Planner API is operational',
    timestamp: new Date().toISOString(),
    today: getTodayDate(),
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/meals/tonight',
      '/api/meals/tomorrow'
    ]
  });
});

// Database health check endpoint
app.get('/api/debug/tables', async (req, res) => {
  try {
    // Test database connectivity
    const { count, error } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Database connectivity error:', error);
      return res.status(503).json({
        status: 'Database unavailable',
        error: error.message
      });
    }

    res.json({
      status: 'Database connected',
      totalMealPlans: count || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'Database error',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Tonight's meal: http://localhost:${PORT}/api/meals/tonight?userId=YOUR_USER_ID`);
  console.log(`Tomorrow's meal: http://localhost:${PORT}/api/meals/tomorrow?userId=YOUR_USER_ID`);
});