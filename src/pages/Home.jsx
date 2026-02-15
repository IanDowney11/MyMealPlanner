import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Card, CardContent, CardMedia, Box, Chip, CircularProgress, Rating } from '@mui/material';
import { CalendarMonth as CalendarIcon, Casino as RandomIcon } from '@mui/icons-material';
import { initDB, getMealPlan } from '../services/mealsService';
import { getSnacks } from '../services/snacksService';
import { getUserTimezone } from '../services/timezoneService';
import { useSyncStatus } from '../contexts/SyncContext';

function Home() {
  const [todaysPlannedMeal, setTodaysPlannedMeal] = useState(null);
  const [loadingPlannedMeal, setLoadingPlannedMeal] = useState(true);
  const [randomSnack, setRandomSnack] = useState(null);
  const [loadingRandomSnack, setLoadingRandomSnack] = useState(false);
  const { dataVersion } = useSyncStatus();

  useEffect(() => {
    loadTodaysPlannedMeal();
  }, [dataVersion]);

  const loadTodaysPlannedMeal = async () => {
    try {
      await initDB();

      // Get today's date in user's timezone
      const timezone = await getUserTimezone();
      const today = new Date();
      const todayStr = today.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const [month, day, year] = todayStr.split('/');
      const todayFormatted = `${year}-${month}-${day}`;

      const mealPlan = await getMealPlan(todayFormatted);
      setTodaysPlannedMeal(mealPlan?.meal || null);
    } catch (error) {
      console.error('Error loading today\'s planned meal:', error);
    } finally {
      setLoadingPlannedMeal(false);
    }
  };

  const handleRandomSnack = async () => {
    try {
      setLoadingRandomSnack(true);
      const snacks = await getSnacks();

      if (snacks.length === 0) {
        alert('No snacks available! Add some snacks first.');
        return;
      }

      // Get a random snack
      const randomIndex = Math.floor(Math.random() * snacks.length);
      const selectedSnack = snacks[randomIndex];
      setRandomSnack(selectedSnack);
    } catch (error) {
      console.error('Error getting random snack:', error);
      alert('Error getting random snack. Please try again.');
    } finally {
      setLoadingRandomSnack(false);
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
                sx={{ mb: todaysPlannedMeal.selectedVersion ? 0.5 : 1, fontWeight: 'bold' }}
              >
                {todaysPlannedMeal.title}
              </Typography>

              {todaysPlannedMeal.selectedVersion && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    fontStyle: 'italic',
                    fontSize: '1rem'
                  }}
                >
                  {todaysPlannedMeal.selectedVersion}
                </Typography>
              )}

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
                    label={`${todaysPlannedMeal.freezerPortions} ${todaysPlannedMeal.freezerPortions === 1 ? 'portion' : 'portions'} in fridge/freezer`}
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

      {/* Random Snack Section */}
      <Card sx={{ mt: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Random Snack Suggestion
          </Typography>
          <Button
            onClick={handleRandomSnack}
            variant="contained"
            color="inherit"
            startIcon={<RandomIcon />}
            disabled={loadingRandomSnack}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {loadingRandomSnack ? 'Getting...' : 'Get Random Snack'}
          </Button>
        </Box>

        <CardContent>
          {randomSnack ? (
            <>
              {randomSnack.image ? (
                <CardMedia
                  component="img"
                  height="150"
                  image={randomSnack.image}
                  alt={randomSnack.title}
                  sx={{ borderRadius: 1, mb: 2 }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 150,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    mb: 2
                  }}
                >
                  🍿
                </Box>
              )}

              <Typography
                variant="h5"
                component="h3"
                sx={{ mb: 1, fontWeight: 'bold' }}
              >
                {randomSnack.title}
              </Typography>

              {randomSnack.description && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.6 }}
                >
                  {randomSnack.description}
                </Typography>
              )}

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
                  to="/snacks"
                  variant="outlined"
                  size="small"
                >
                  View All Snacks
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, px: 3 }}>
              <Typography sx={{ fontSize: '48px', mb: 2 }}>🍿</Typography>
              <Typography
                variant="h6"
                component="h3"
                sx={{ mb: 1, fontWeight: 'bold' }}
              >
                Need a snack idea?
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                Click the button above to get a random snack suggestion from your collection!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Home;