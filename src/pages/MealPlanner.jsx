import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  Typography,
  Card,
  CardContent,
  Paper,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  Rating
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';
import DragDropProvider from '../components/DragDropProvider';
import MealAssignmentModal from '../components/MealAssignmentModal';
import { getMeals, initDB, saveMealPlan, deleteMealPlan, getWeekMealPlans } from '../services/storage';

const MEAL_TYPE = 'meal';

function MealPlannerContent() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [draggedMeal, setDraggedMeal] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  // Mobile modal state
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [selectedMealForModal, setSelectedMealForModal] = useState(null);

  // Calculate week dates based on selected week offset
  const getWeekDates = (weekOffset = selectedWeekOffset) => {
    const today = new Date();
    const monday = getMonday(today);

    // Add the week offset (7 days per week)
    monday.setDate(monday.getDate() + (weekOffset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = formatDate(date);
    const todayStr = formatDate(today);
    const tomorrowStr = formatDate(tomorrow);

    if (dateStr === todayStr) {
      return `Today (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    } else if (dateStr === tomorrowStr) {
      return `Tomorrow (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const weekDates = getWeekDates(selectedWeekOffset);

  useEffect(() => {
    loadMeals();
    loadWeekPlan();
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (weekDates.length > 0) {
      const mondayStr = formatDate(weekDates[0]);
      setCurrentWeekStart(mondayStr);
      loadWeekPlan();
    }
  }, [selectedWeekOffset]);

  const checkScreenSize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (mobile) {
      setSidebarOpen(false);
    }
  };

  const loadMeals = async () => {
    try {
      await initDB();
      const mealsList = await getMeals();
      setMeals(mealsList);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekPlan = async () => {
    try {
      if (weekDates.length > 0) {
        const mondayStr = formatDate(weekDates[0]);
        const weekPlans = await getWeekMealPlans(mondayStr);

        const planMap = {};
        weekPlans.forEach(plan => {
          planMap[plan.date] = plan.meal;
        });

        setWeeklyPlan(planMap);
      }
    } catch (error) {
      console.error('Error loading week plan:', error);
    }
  };

  const handleMealAssignment = async (date, meal) => {
    try {
      const dateStr = formatDate(date);
      const savedPlan = await saveMealPlan(dateStr, meal);

      // Update weekly plan with the updated meal data and fromFreezer info
      setWeeklyPlan(prev => ({
        ...prev,
        [dateStr]: savedPlan
      }));

      // Reload meals to update freezer counts in sidebar
      await loadMeals();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Error saving meal plan. Please try again.');
    }
  };

  const handleMobileModalOpen = (meal) => {
    setSelectedMealForModal(meal);
    setMobileModalOpen(true);
  };

  const handleMobileModalClose = () => {
    setMobileModalOpen(false);
    setSelectedMealForModal(null);
  };

  const removeMealFromDay = async (date) => {
    try {
      const dateStr = formatDate(date);
      await deleteMealPlan(dateStr);

      setWeeklyPlan(prev => {
        const newPlan = { ...prev };
        delete newPlan[dateStr];
        return newPlan;
      });

      // Reload meals to update freezer counts in sidebar
      await loadMeals();
    } catch (error) {
      console.error('Error removing meal plan:', error);
      alert('Error removing meal plan. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const goToNextWeek = () => {
    setSelectedWeekOffset(prev => prev + 1);
  };

  const goToLastWeek = () => {
    setSelectedWeekOffset(prev => prev - 1);
  };

  const goToCurrentWeek = () => {
    setSelectedWeekOffset(0);
  };

  const getWeekDisplayText = () => {
    if (selectedWeekOffset === 0) {
      return "This Week";
    } else if (selectedWeekOffset === 1) {
      return "Next Week";
    } else if (selectedWeekOffset === -1) {
      return "Last Week";
    } else if (selectedWeekOffset > 1) {
      return `${selectedWeekOffset} Weeks Ahead`;
    } else {
      return `${Math.abs(selectedWeekOffset)} Weeks Ago`;
    }
  };

  const DraggableMealCard = ({ meal }) => {
    const [{ isDragging }, drag] = useDrag({
      type: MEAL_TYPE,
      item: meal,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <Card
        ref={drag}
        onClick={() => isMobile && handleMobileModalOpen(meal)}
        sx={{
          mb: 1.5,
          cursor: isMobile ? 'pointer' : 'grab',
          border: '2px solid transparent',
          transition: 'all 0.3s ease',
          userSelect: 'none',
          opacity: isDragging ? 0.5 : 1,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 2
          }
        }}
      >
        {renderMealCardContent(meal, true)}
      </Card>
    );
  };

  const StaticMealCard = ({ data }) => {
    const meal = data.meal || data;
    const isFromFreezer = data.fromFreezer || false;

    return (
      <Card sx={{ mb: 1.5 }}>
        {renderMealCardContent(meal, false, isFromFreezer)}
      </Card>
    );
  };

  const renderMealCardContent = (meal, isInSidebar = true, isFromFreezer = false) => {
    return (
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {meal.image ? (
            <Avatar
              src={meal.image}
              alt={meal.title}
              sx={{
                width: 50,
                height: 50,
                borderRadius: 1
              }}
              variant="rounded"
            />
          ) : (
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontSize: '20px'
              }}
              variant="rounded"
            >
              🥘
            </Avatar>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5
              }}
            >
              {meal.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Rating
                value={meal.rating || 0}
                readOnly
                size="small"
                precision={1}
              />
              {isInSidebar ? (
                // Sidebar: show freezer portions count
                meal.freezerPortions > 0 && (
                  <Chip
                    label={`${meal.freezerPortions} ${meal.freezerPortions === 1 ? 'portion' : 'portions'} frozen`}
                    color="success"
                    size="small"
                    sx={{
                      fontSize: '11px',
                      height: 20,
                      maxWidth: '100%',
                      '& .MuiChip-label': {
                        px: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }
                    }}
                  />
                )
              ) : (
                // Calendar: show freezer vs fresh indicator
                <Chip
                  label={isFromFreezer ? '🧊 From Freezer' : '🔥 Cook Fresh'}
                  color={isFromFreezer ? 'info' : 'warning'}
                  size="small"
                  sx={{
                    fontSize: '11px',
                    height: 20,
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                      px: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    );
  };

  const DroppableCalendarDay = ({ date }) => {
    const dateStr = formatDate(date);
    const plannedMeal = weeklyPlan[dateStr];

    const [{ isOver }, drop] = useDrop({
      accept: MEAL_TYPE,
      drop: (meal) => handleMealAssignment(date, meal),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <Paper
        ref={drop}
        key={dateStr}
        elevation={1}
        sx={{
          p: 2,
          minHeight: 200,
          border: '2px dashed',
          borderColor: isOver ? 'primary.main' : 'divider',
          backgroundColor: isOver ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 2,
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
            lineHeight: 1.3
          }}
        >
          {formatDisplayDate(date)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 1.5 }}
        >
          Dinner
        </Typography>

        {plannedMeal ? (
          <Box sx={{ position: 'relative' }}>
            <StaticMealCard data={plannedMeal} />
            <IconButton
              onClick={() => removeMealFromDay(date)}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'error.dark',
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              color: 'text.disabled',
              fontStyle: 'italic',
              py: 5,
              px: 2.5
            }}
          >
            <Typography variant="body2" color="text.disabled">
              {isMobile ? 'Tap a meal to schedule' : 'Drag a meal here'}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 2 }}>
        <CircularProgress color="primary" size={40} />
        <Typography variant="h6" color="text.secondary">
          Loading meal planner...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 64px)', // Subtract navigation height
      bgcolor: 'background.default',
      position: 'relative'
    }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Paper
        elevation={isMobile ? 2 : 0}
        sx={{
          width: sidebarOpen ? 320 : 0,
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          zIndex: isMobile ? 1000 : 1,
          position: isMobile ? 'fixed' : 'relative',
          height: '100%',
          borderRadius: 0
        }}
      >
        <Box sx={{ p: 2.5, pt: isMobile ? 2.5 : 4, height: '100%', overflowY: 'auto' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5
          }}>
            <Typography
              variant="h6"
              color="text.primary"
            >
              Available Meals
            </Typography>
            {isMobile && (
              <IconButton
                onClick={() => setSidebarOpen(false)}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {meals.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              py: 5,
              px: 2.5,
              color: 'text.secondary'
            }}>
              <Typography variant="body1" gutterBottom>
                No meals available.
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Add some meals first!
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  fontStyle: 'italic'
                }}
              >
                {isMobile ? 'Tap meals to schedule them' : 'Drag meals to plan your week'}
              </Typography>
              {meals.map(meal => (
                <DraggableMealCard key={meal.id} meal={meal} />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            borderRadius: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={toggleSidebar}
              color="primary"
              sx={{
                border: 1,
                borderColor: 'divider'
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant={isMobile ? "h5" : "h4"} color="text.primary">
              Weekly Meal Planner
            </Typography>
          </Box>

          {/* Week Navigation */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap'
          }}>
            <Button
              onClick={goToLastWeek}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              color="inherit"
            >
              Last Week
            </Button>

            <Chip
              label={`📅 ${getWeekDisplayText()}`}
              color={selectedWeekOffset === 0 ? "primary" : "default"}
              onClick={selectedWeekOffset !== 0 ? goToCurrentWeek : undefined}
              sx={{
                minWidth: 120,
                fontWeight: 'bold',
                cursor: selectedWeekOffset !== 0 ? 'pointer' : 'default'
              }}
            />

            <Button
              onClick={goToNextWeek}
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              color="inherit"
            >
              Next Week
            </Button>
          </Box>

          <Box sx={{
            textAlign: 'right'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {weekDates.length > 0 &&
                `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              }
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              {Object.keys(weeklyPlan).length} of 7 days planned
            </Typography>
          </Box>
        </Paper>

        {/* Calendar Grid */}
        <Box sx={{
          flex: 1,
          p: 2.5,
          overflowY: 'auto'
        }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2.5,
            maxWidth: 1400,
            margin: '0 auto'
          }}>
            {weekDates.map(date => (
              <DroppableCalendarDay key={formatDate(date)} date={date} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Mobile Modal */}
      <MealAssignmentModal
        open={mobileModalOpen}
        onClose={handleMobileModalClose}
        meal={selectedMealForModal}
        weekDates={weekDates}
        weeklyPlan={weeklyPlan}
        onAssignMeal={handleMealAssignment}
        formatDisplayDate={formatDisplayDate}
      />
    </Box>
  );
}

function MealPlanner() {
  return (
    <DragDropProvider>
      <MealPlannerContent />
    </DragDropProvider>
  );
}

export default MealPlanner;