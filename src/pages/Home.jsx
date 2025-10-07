import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Card, CardContent, CardMedia, Box, Chip, CircularProgress, Rating } from '@mui/material';
import { Add as AddIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import MealForm from '../components/MealForm';
import { saveMeal, initDB, getMealPlan } from '../services/mealsService';

function Home() {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showMealForm, setShowMealForm] = useState(false);
  const [todaysPlannedMeal, setTodaysPlannedMeal] = useState(null);
  const [loadingPlannedMeal, setLoadingPlannedMeal] = useState(true);

  useEffect(() => {
    loadTodaysPlannedMeal();
  }, []);

  const loadTodaysPlannedMeal = async () => {
    try {
      await initDB();
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      const mealPlan = await getMealPlan(todayStr);
      setTodaysPlannedMeal(mealPlan?.meal || null);
    } catch (error) {
      console.error('Error loading today\'s planned meal:', error);
    } finally {
      setLoadingPlannedMeal(false);
    }
  };

  const handleStarClick = (starIndex) => {
    setRating(starIndex);
  };

  const handleStarHover = (starIndex) => {
    setHoveredStar(starIndex);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleSaveMeal = async (mealData) => {
    try {
      await initDB();
      await saveMeal(mealData);
      setShowMealForm(false);
      alert('Meal saved successfully! You can view it in the Meals section.');
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          textAlign: 'center',
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main'
        }}
      >
        Today's Meal Plan
      </Typography>

      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Tonight's Dinner
          </Typography>
        </Box>

        <CardContent>
          {loadingPlannedMeal ? (
            <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading tonight's dinner plan...
              </Typography>
            </Box>
          ) : todaysPlannedMeal ? (
            <>
              {todaysPlannedMeal.image ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={todaysPlannedMeal.image}
                  alt={todaysPlannedMeal.title}
                  sx={{ borderRadius: 1, mb: 2 }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    mb: 2
                  }}
                >
                  🥘
                </Box>
              )}

              <Typography
                variant="h5"
                component="h3"
                sx={{ mb: 1, fontWeight: 'bold' }}
              >
                {todaysPlannedMeal.title}
              </Typography>

              {todaysPlannedMeal.description && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.6 }}
                >
                  {todaysPlannedMeal.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {todaysPlannedMeal.rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rating:
                    </Typography>
                    <Rating
                      value={todaysPlannedMeal.rating}
                      readOnly
                      size="small"
                      precision={1}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({todaysPlannedMeal.rating}/5)
                    </Typography>
                  </Box>
                )}

                {todaysPlannedMeal.freezerPortions > 0 && (
                  <Chip
                    label={`${todaysPlannedMeal.freezerPortions} ${todaysPlannedMeal.freezerPortions === 1 ? 'portion' : 'portions'} in freezer`}
                    color="success"
                    variant="filled"
                    size="small"
                  />
                )}
              </Box>

              <Box
                sx={{
                  borderTop: 1,
                  borderColor: 'divider',
                  pt: 2,
                  textAlign: 'center'
                }}
              >
                <Button
                  component={Link}
                  to="/meal-planner"
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  size="small"
                >
                  View Meal Planner
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
              <Typography sx={{ fontSize: '48px', mb: 3 }}>🤔</Typography>
              <Typography
                variant="h5"
                component="h3"
                sx={{ mb: 2, fontWeight: 'bold' }}
              >
                No dinner planned for tonight
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                Plan your meals for the week to see what's for dinner tonight!
              </Typography>
              <Button
                component={Link}
                to="/meal-planner"
                variant="contained"
                startIcon={<CalendarIcon />}
                size="large"
              >
                Plan Your Meals
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center', mt: 4, mb: 3 }}>
        <Button
          onClick={() => setShowMealForm(true)}
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          size="large"
          sx={{
            py: 2,
            px: 4,
            fontSize: '1.125rem',
            fontWeight: 'bold'
          }}
        >
          Quick Add New Meal
        </Button>
      </Box>

      {/* Meal Form Modal */}
      {showMealForm && (
        <MealForm
          meal={null}
          onSave={handleSaveMeal}
          onCancel={() => setShowMealForm(false)}
        />
      )}
    </Box>
  );
}

export default Home;