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
  Rating,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Autocomplete
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  LocalOffer as TagIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';
import DragDropProvider from '../components/DragDropProvider';
import MealAssignmentModal from '../components/MealAssignmentModal';
import { getMeals, initDB, saveMealPlan, deleteMealPlan, getWeekMealPlans, copyLastWeekMealPlans } from '../services/mealsService';
import { getEventsForDate, saveEvent, deleteEvent } from '../services/eventsService';
import EventModal from '../components/EventModal';
import VersionSelectionModal from '../components/VersionSelectionModal';

const MEAL_TYPE = 'meal';

function MealPlannerContent() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  // Mobile modal state
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [selectedMealForModal, setSelectedMealForModal] = useState(null);

  // Events state
  const [dayEvents, setDayEvents] = useState({});
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);

  // Version selection state
  const [versionSelectionOpen, setVersionSelectionOpen] = useState(false);
  const [mealForVersionSelection, setMealForVersionSelection] = useState(null);
  const [dateForVersionSelection, setDateForVersionSelection] = useState(null);
  const [eventMenuAnchor, setEventMenuAnchor] = useState(null);
  const [eventMenuData, setEventMenuData] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

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
      return `Today (${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;
    } else if (dateStr === tomorrowStr) {
      return `Tomorrow (${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;
    } else {
      return date.toLocaleDateString(undefined, {
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
    loadWeekEvents();
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (weekDates.length > 0) {
      const mondayStr = formatDate(weekDates[0]);
      setCurrentWeekStart(mondayStr);
      loadWeekPlan();
      loadWeekEvents();
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

  const loadWeekEvents = async () => {
    try {
      if (weekDates.length > 0) {
        const eventsMap = {};

        // Load events for each day of the week
        for (const date of weekDates) {
          const dateStr = formatDate(date);
          const events = await getEventsForDate(dateStr);
          if (events.length > 0) {
            eventsMap[dateStr] = events;
          }
        }

        setDayEvents(eventsMap);
      }
    } catch (error) {
      console.error('Error loading week events:', error);
    }
  };

  const handleMealAssignment = async (date, meal, selectedVersion = null) => {
    try {
      const dateStr = formatDate(date);

      // Create meal with version information
      const mealWithVersion = {
        ...meal,
        selectedVersion: selectedVersion
      };

      const savedPlan = await saveMealPlan(dateStr, mealWithVersion);

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

  const handleVersionSelectionClose = () => {
    setVersionSelectionOpen(false);
    setMealForVersionSelection(null);
    setDateForVersionSelection(null);
  };

  const handleVersionSelect = async (selectedVersion) => {
    try {
      await handleMealAssignment(dateForVersionSelection, mealForVersionSelection, selectedVersion);
      handleVersionSelectionClose();
    } catch (error) {
      console.error('Error assigning meal with version:', error);
    }
  };

  const handleDragDrop = (date, meal) => {
    const hasVersions = meal.versions && meal.versions.length > 0;

    if (hasVersions) {
      // Show version selection modal
      setMealForVersionSelection(meal);
      setDateForVersionSelection(date);
      setVersionSelectionOpen(true);
    } else {
      // Assign meal directly
      handleMealAssignment(date, meal, null);
    }
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

  // Event handling functions
  const handleAddEvent = (date) => {
    setSelectedDateForEvent(date);
    setSelectedEvent(null);
    setEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDateForEvent(null);
    setEventModalOpen(true);
    setEventMenuAnchor(null);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      await loadWeekEvents();
      setEventMenuAnchor(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      await saveEvent(eventData);
      await loadWeekEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    }
  };

  const handleEventMenuOpen = (event, eventData) => {
    setEventMenuAnchor(event.currentTarget);
    setEventMenuData(eventData);
  };

  const handleEventMenuClose = () => {
    setEventMenuAnchor(null);
    setEventMenuData(null);
  };

  const handleCopyLastWeek = async () => {
    if (!currentWeekStart) return;

    const confirmMessage = 'This will copy all meals from last week to the current week. Any existing meals for this week will be replaced. Continue?';
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      // Ensure currentWeekStart is a proper Date object
      const weekStartDate = currentWeekStart instanceof Date ? currentWeekStart : new Date(currentWeekStart);
      const currentWeekKey = weekStartDate.toISOString().split('T')[0];

      console.log('Current week start:', currentWeekStart);
      console.log('Current week key:', currentWeekKey);

      await copyLastWeekMealPlans(currentWeekKey);

      // Reload the week plan to show the copied meals
      await loadWeekPlan();

      alert('Successfully copied last week\'s meals!');
    } catch (error) {
      console.error('Error copying last week:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);

      let errorMessage = 'Failed to copy last week\'s meals. ';

      if (error.message === 'No meals found in last week to copy') {
        errorMessage += 'There are no meals planned for last week.';
      } else if (error.message === 'Not authenticated') {
        errorMessage += 'You are not logged in. Please log in and try again.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
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
                mb: meal.selectedVersion ? 0.25 : 0.5
              }}
            >
              {meal.title}
            </Typography>
            {meal.versions && meal.versions.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                {meal.versions.length} version{meal.versions.length !== 1 ? 's' : ''}
              </Typography>
            )}
            {meal.selectedVersion && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontStyle: 'italic',
                  fontSize: '0.75rem',
                  mb: 0.5,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {meal.selectedVersion}
              </Typography>
            )}
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
                    label={`${meal.freezerPortions} ${meal.freezerPortions === 1 ? 'portion' : 'portions'} in fridge/freezer`}
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
                  label={isFromFreezer ? '🧊 From Fridge/Freezer' : '🔥 Cook Fresh'}
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
              {meal.tags && meal.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, mt: 0.5 }}>
                  {meal.tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{
                        fontSize: '0.6rem',
                        height: 16,
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  ))}
                  {meal.tags.length > 3 && (
                    <Chip
                      label={`+${meal.tags.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.6rem',
                        height: 16,
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  )}
                </Box>
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
    const events = dayEvents[dateStr] || [];

    const [{ isOver }, drop] = useDrop({
      accept: MEAL_TYPE,
      drop: (meal) => handleDragDrop(date, meal),
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              textAlign: 'center',
              lineHeight: 1.3
            }}
          >
            {formatDisplayDate(date)}
          </Typography>

          <Tooltip title="Add Event">
            <IconButton
              size="small"
              onClick={() => handleAddEvent(date)}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.main', color: 'white' }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Events Section */}
        {events.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {events.map((event, index) => (
              <Badge
                key={event.id}
                badgeContent={
                  <Tooltip title="Event Options">
                    <IconButton
                      size="small"
                      onClick={(e) => handleEventMenuOpen(e, event)}
                      sx={{
                        color: 'white',
                        width: 16,
                        height: 16,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <MoreVertIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  display: 'block',
                  mb: index < events.length - 1 ? 0.5 : 0,
                  '& .MuiBadge-badge': {
                    right: -6,
                    top: -6,
                    bgcolor: 'secondary.main'
                  }
                }}
              >
                <Chip
                  icon={<EventIcon />}
                  label={event.title}
                  size="small"
                  color="secondary"
                  sx={{
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </Badge>
            ))}
            <Divider sx={{ mt: 1, mb: 1.5 }} />
          </Box>
        )}

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
              py: 3,
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

          {/* Tag Filter */}
          {(() => {
            const allTags = [...new Set(meals.flatMap(meal => meal.tags || []))].sort();
            return allTags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  multiple
                  options={allTags}
                  value={selectedTags}
                  onChange={(event, newValue) => setSelectedTags(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Filter by tags..."
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <TagIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 16 }} />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    ))
                  }
                />
                {selectedTags.length > 0 && (
                  <Button
                    onClick={() => setSelectedTags([])}
                    size="small"
                    startIcon={<ClearIcon />}
                    sx={{ mt: 1, fontSize: '0.7rem' }}
                  >
                    Clear Tags
                  </Button>
                )}
              </Box>
            );
          })()}

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
              {meals
                .filter(meal => {
                  // Tag filtering
                  return selectedTags.length === 0 ||
                    selectedTags.every(tag => meal.tags?.includes(tag));
                })
                .map(meal => (
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

            {/* Copy Last Week Button - only show for current week */}
            {selectedWeekOffset === 0 && (
              <Button
                onClick={handleCopyLastWeek}
                variant="contained"
                startIcon={<CopyIcon />}
                color="secondary"
                sx={{ ml: 1 }}
              >
                Copy Last Week
              </Button>
            )}
          </Box>

          <Box sx={{
            textAlign: 'right'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {weekDates.length > 0 &&
                `${weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
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

      {/* Event Modal */}
      <EventModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        selectedDate={selectedDateForEvent}
      />

      {/* Event Context Menu */}
      <Menu
        anchorEl={eventMenuAnchor}
        open={Boolean(eventMenuAnchor)}
        onClose={handleEventMenuClose}
      >
        <MenuItem onClick={() => handleEditEvent(eventMenuData)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Event</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteEvent(eventMenuData?.id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Event</ListItemText>
        </MenuItem>
      </Menu>

      {/* Version Selection Modal */}
      <VersionSelectionModal
        meal={mealForVersionSelection}
        open={versionSelectionOpen}
        onClose={handleVersionSelectionClose}
        onSelect={handleVersionSelect}
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