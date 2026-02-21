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
  Divider,
  Rating,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Autocomplete,
  Skeleton,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  Clear as ClearIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';
import DragDropProvider from '../components/DragDropProvider';
import MealAssignmentModal from '../components/MealAssignmentModal';
import ProgressiveImage from '../components/ProgressiveImage';
import { getMeals, initDB, saveMealPlan, deleteMealPlan, getWeekMealPlans, copyLastWeekMealPlans } from '../services/mealsService';
import { getEventsForDate, saveEvent, deleteEvent } from '../services/eventsService';
import EventModal from '../components/EventModal';
import VersionSelectionModal from '../components/VersionSelectionModal';
import { getUserTimezone } from '../services/timezoneService';
import { useSyncStatus } from '../contexts/SyncContext';

const MEAL_TYPE = 'meal';

function MealPlannerContent() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [timezone, setTimezone] = useState('UTC');

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
  const [mealSearchTerm, setMealSearchTerm] = useState('');
  const [mealsExpanded, setMealsExpanded] = useState(false);
  const { dataVersion } = useSyncStatus();

  // Calculate week dates based on selected week offset
  const getWeekDates = (weekOffset = selectedWeekOffset) => {
    const today = new Date();
    const sunday = getSunday(today);

    // Add the week offset (7 days per week)
    sunday.setDate(sunday.getDate() + (weekOffset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const getSunday = (date) => {
    // Get the day-of-week in the user's timezone
    const dayStr = date.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'short'
    });
    const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const dayOfWeek = dayMap[dayStr];

    const d = new Date(date);
    d.setDate(d.getDate() - dayOfWeek);
    return d;
  };

  const formatDate = (date) => {
    // Format date in user's timezone
    const dateStr = date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = formatDate(date);
    const todayStr = formatDate(today);
    const tomorrowStr = formatDate(tomorrow);

    if (dateStr === todayStr) {
      return `Today (${date.toLocaleDateString('en-US', { timeZone: timezone, month: 'short', day: 'numeric' })})`;
    } else if (dateStr === tomorrowStr) {
      return `Tomorrow (${date.toLocaleDateString('en-US', { timeZone: timezone, month: 'short', day: 'numeric' })})`;
    } else {
      return date.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const weekDates = getWeekDates(selectedWeekOffset);

  useEffect(() => {
    const init = async () => {
      const tz = await loadTimezone();
      // Only load data after timezone is resolved so date formatting is correct
      loadMeals();
      loadWeekPlanWithTimezone(tz);
      loadWeekEventsWithTimezone(tz);
    };
    init();
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Re-fetch when incoming sync data arrives
  useEffect(() => {
    if (dataVersion > 0) {
      loadMeals();
      loadWeekPlan();
      loadWeekEvents();
    }
  }, [dataVersion]);

  const loadTimezone = async () => {
    try {
      const tz = await getUserTimezone();
      setTimezone(tz);
      return tz;
    } catch (error) {
      console.error('Error loading timezone:', error);
      return 'UTC';
    }
  };

  useEffect(() => {
    if (weekDates.length > 0 && timezone !== 'UTC') {
      const mondayStr = formatDate(weekDates[0]);
      setCurrentWeekStart(mondayStr);
      loadWeekPlan();
      loadWeekEvents();
    }
  }, [selectedWeekOffset, timezone]);

  const checkScreenSize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    // Always keep sidebar open on mobile for vertical layout
    if (mobile) {
      setSidebarOpen(true);
    }
  };

  const loadMeals = async () => {
    try {
      await initDB();
      const mealsList = await getMeals();
      setMeals(prev => {
        if (prev.length === mealsList.length &&
          prev.every((m, i) => m.id === mealsList[i].id && m.updatedAt === mealsList[i].updatedAt)) {
          return prev;
        }
        return mealsList;
      });
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date using a specific timezone (for initial load before state is set)
  const formatDateWithTz = (date, tz) => {
    const dateStr = date.toLocaleString('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const loadWeekPlan = async () => {
    return loadWeekPlanWithTimezone(timezone);
  };

  const loadWeekPlanWithTimezone = async (tz) => {
    try {
      if (weekDates.length > 0) {
        const mondayStr = formatDateWithTz(weekDates[0], tz);
        const weekPlans = await getWeekMealPlans(mondayStr);

        const planMap = {};
        weekPlans.forEach(plan => {
          planMap[plan.date] = {
            meal: plan.meal,
            fromFreezer: plan.fromFreezer
          };
        });

        setWeeklyPlan(planMap);
      }
    } catch (error) {
      console.error('Error loading week plan:', error);
    }
  };

  const loadWeekEvents = async () => {
    return loadWeekEventsWithTimezone(timezone);
  };

  const loadWeekEventsWithTimezone = async (tz) => {
    try {
      if (weekDates.length > 0) {
        const eventsMap = {};

        for (const date of weekDates) {
          const dateStr = formatDateWithTz(date, tz);
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
        [dateStr]: {
          meal: savedPlan.meal,
          fromFreezer: savedPlan.fromFreezer
        }
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
          <ProgressiveImage
            src={meal.image}
            alt={meal.title}
            width={50}
            height={50}
            variant="rounded"
            fallbackIcon="🥘"
            lazy={true}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: meal.selectedVersion ? 0.25 : 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {meal.title}
              </Typography>
              {meal.recipeUrl && (
                <Tooltip title="Open recipe">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(meal.recipeUrl, '_blank', 'noopener,noreferrer');
                    }}
                    sx={{
                      p: 0.5,
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
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
          p: { xs: 1.5, sm: 2 },
          minHeight: { xs: 180, sm: 200 },
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              textAlign: 'center',
              lineHeight: 1.3,
              fontSize: { xs: '0.95rem', sm: '1.25rem' },
              fontWeight: 600
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
                minWidth: 44,
                minHeight: 44,
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
          sx={{ textAlign: 'center', mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
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
                top: 4,
                right: 4,
                backgroundColor: 'error.main',
                color: 'white',
                minWidth: { xs: 36, sm: 32 },
                minHeight: { xs: 36, sm: 32 },
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
              py: { xs: 2, sm: 3 },
              px: 2
            }}
          >
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {isMobile ? 'Tap a meal to schedule' : 'Drag a meal here'}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
        overflow: { xs: 'auto', md: 'hidden' }
      }}>
        {/* Sidebar Skeleton */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 320 },
            maxHeight: { xs: '40vh', md: '100%' },
            borderRight: { xs: 0, md: 1 },
            borderBottom: { xs: 1, md: 0 },
            borderColor: 'divider',
            p: { xs: 2, md: 2.5 },
            pt: { xs: 2, md: 4 }
          }}
        >
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2.5 }} />
          <Skeleton variant="rounded" width="100%" height={44} sx={{ mb: 2 }} />
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} sx={{ mb: 1.5 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="rounded" width={50} height={50} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>

        {/* Main Content Skeleton */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header Skeleton */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={100} height={36} />
              <Skeleton variant="rounded" width={120} height={36} />
              <Skeleton variant="rounded" width={100} height={36} />
            </Box>
            <Skeleton variant="text" width={120} height={24} />
          </Paper>

          {/* Calendar Grid Skeleton */}
          <Box sx={{
            flex: { xs: 'unset', md: 1 },
            p: { xs: 1.5, md: 2.5 },
            overflowY: { xs: 'visible', md: 'auto' },
            pb: { xs: 4, md: 2.5 }
          }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(280px, 1fr))' },
              gap: { xs: 1.5, md: 2.5 },
              maxWidth: { xs: '100%', md: 1400 },
              margin: '0 auto'
            }}>
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <Paper key={i} elevation={1} sx={{ p: 2, minHeight: 200 }}>
                  <Skeleton variant="text" width="70%" height={28} sx={{ mb: 2, mx: 'auto' }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1.5, mx: 'auto' }} />
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="rounded" width={50} height={50} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="80%" height={24} />
                          <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      height: 'calc(100vh - 64px)',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: { xs: 'auto', md: 'hidden' }
    }}>

      {/* Desktop Sidebar - hidden on mobile */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: { md: sidebarOpen ? 320 : 0 },
          height: '100%',
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          position: 'relative',
          borderRadius: 0
        }}
      >
        <Box sx={{
          p: 2.5,
          pt: 4,
          height: '100%',
          overflowY: 'auto'
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5
          }}>
            <Typography variant="h6" color="text.primary">
              Available Meals
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            placeholder="Search meals..."
            value={mealSearchTerm}
            onChange={(e) => setMealSearchTerm(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
            }}
          />

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
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Filter by tags..."
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <TagIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
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
                        sx={{
                          fontSize: '0.75rem',
                          height: 20,
                          m: 0.25,
                          '& .MuiChip-deleteIcon': {
                            fontSize: 16,
                            m: 0.5
                          }
                        }}
                      />
                    ))
                  }
                />
                {selectedTags.length > 0 && (
                  <Button
                    onClick={() => setSelectedTags([])}
                    size="small"
                    startIcon={<ClearIcon />}
                    sx={{ mt: 1, fontSize: '0.75rem' }}
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
                sx={{ mb: 2, fontStyle: 'italic' }}
              >
                Drag meals to plan your week
              </Typography>
              {meals
                .filter(meal => {
                  const searchMatch = !mealSearchTerm || meal.title?.toLowerCase().includes(mealSearchTerm.toLowerCase());
                  const tagMatch = selectedTags.length === 0 ||
                    selectedTags.every(tag => meal.tags?.includes(tag));
                  return searchMatch && tagMatch;
                })
                .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
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
            p: { xs: 1.5, sm: 2.5 },
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: { xs: 1.5, sm: 2 },
            borderRadius: 0
          }}
        >
          {!isMobile && (
            <Tooltip title={sidebarOpen ? 'Hide meals' : 'Show meals'}>
              <IconButton
                onClick={toggleSidebar}
                color="primary"
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 44,
                  minHeight: 44
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Week Navigation */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'nowrap',
            justifyContent: 'center',
            flex: { xs: 1, sm: 'unset' }
          }}>
            <IconButton
              onClick={goToLastWeek}
              color="primary"
              size={isMobile ? "medium" : "large"}
              sx={{
                border: 1,
                borderColor: 'divider',
                minWidth: { xs: 44, sm: 48 },
                minHeight: { xs: 44, sm: 48 }
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Chip
              label={getWeekDisplayText()}
              color={selectedWeekOffset === 0 ? "primary" : "default"}
              onClick={selectedWeekOffset !== 0 ? goToCurrentWeek : undefined}
              size={isMobile ? "medium" : "medium"}
              sx={{
                minWidth: { xs: 100, sm: 120 },
                fontWeight: 'bold',
                cursor: selectedWeekOffset !== 0 ? 'pointer' : 'default',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            />

            <IconButton
              onClick={goToNextWeek}
              color="primary"
              size={isMobile ? "medium" : "large"}
              sx={{
                border: 1,
                borderColor: 'divider',
                minWidth: { xs: 44, sm: 48 },
                minHeight: { xs: 44, sm: 48 }
              }}
            >
              <ArrowForwardIcon />
            </IconButton>

            {/* Copy Last Week Button - hide on mobile, show on desktop when on current week */}
            {selectedWeekOffset === 0 && !isMobile && (
              <Button
                onClick={handleCopyLastWeek}
                variant="contained"
                startIcon={<CopyIcon />}
                color="secondary"
                size="small"
                sx={{ ml: 1 }}
              >
                Copy Last Week
              </Button>
            )}
          </Box>

          <Box sx={{
            textAlign: { xs: 'center', sm: 'right' },
            width: { xs: '100%', sm: 'auto' },
            mt: { xs: 1, sm: 0 }
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {weekDates.length > 0 &&
                `${weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
              }
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              {Object.keys(weeklyPlan).length} of 7 days planned
            </Typography>
          </Box>
        </Paper>

        {/* Mobile Collapsible Meals Section */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Accordion
            expanded={mealsExpanded}
            onChange={() => setMealsExpanded(!mealsExpanded)}
            sx={{
              borderRadius: 0,
              boxShadow: 'none',
              borderBottom: 1,
              borderColor: 'divider',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: 'background.paper',
                minHeight: 56,
                '& .MuiAccordionSummary-content': {
                  my: 1.5
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Available Meals ({meals.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, bgcolor: 'grey.50' }}>
              {/* Search */}
              <TextField
                placeholder="Search meals..."
                value={mealSearchTerm}
                onChange={(e) => setMealSearchTerm(e.target.value)}
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { minHeight: 44 },
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
                }}
              />

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
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Filter by tags..."
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            sx: { minHeight: 44, ...params.InputProps.sx },
                            startAdornment: (
                              <>
                                <TagIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
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
                            sx={{
                              fontSize: '0.75rem',
                              height: 24,
                              m: 0.25,
                              '& .MuiChip-deleteIcon': { fontSize: 18, m: 0.5 }
                            }}
                          />
                        ))
                      }
                    />
                    {selectedTags.length > 0 && (
                      <Button
                        onClick={() => setSelectedTags([])}
                        size="small"
                        startIcon={<ClearIcon />}
                        sx={{ mt: 1, fontSize: '0.75rem', minHeight: 36 }}
                      >
                        Clear Tags
                      </Button>
                    )}
                  </Box>
                );
              })()}

              {meals.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No meals available. Add some meals first!
                </Typography>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Tap meals to schedule them
                  </Typography>
                  {meals
                    .filter(meal => {
                      const searchMatch = !mealSearchTerm || meal.title?.toLowerCase().includes(mealSearchTerm.toLowerCase());
                      const tagMatch = selectedTags.length === 0 ||
                        selectedTags.every(tag => meal.tags?.includes(tag));
                      return searchMatch && tagMatch;
                    })
                    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
                    .map(meal => (
                      <DraggableMealCard key={meal.id} meal={meal} />
                    ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Calendar Grid - Desktop: Grid, Mobile: Vertical List */}
        <Box sx={{
          flex: { xs: 'unset', md: 1 },
          p: { xs: 1.5, md: 2.5 },
          overflowY: { xs: 'visible', md: 'auto' },
          pb: { xs: 4, md: 2.5 }
        }}>
          {/* Desktop Grid */}
          <Box sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2.5,
            maxWidth: 1400,
            margin: '0 auto'
          }}>
            {weekDates.map(date => (
              <DroppableCalendarDay key={formatDate(date)} date={date} />
            ))}
          </Box>

          {/* Mobile Vertical List */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {weekDates.map((date, index) => (
              <Box key={formatDate(date)} sx={{ mb: index < weekDates.length - 1 ? 2 : 0 }}>
                <DroppableCalendarDay date={date} />
              </Box>
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