import React, { useState, useEffect, useMemo } from 'react';
import { Button, IconButton, Typography, Card, CardContent, Box, TextField, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Rating, Autocomplete, Avatar, Divider } from '@mui/material';
import { Add as AddIcon, Clear as ClearIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, UnfoldMore as UnfoldMoreIcon, KeyboardArrowUp as ArrowUpIcon, KeyboardArrowDown as ArrowDownIcon, Schedule as ScheduleIcon, Restaurant as RestaurantIcon, Link as LinkIcon, LocalOffer as TagIcon } from '@mui/icons-material';
import MealForm from '../components/MealForm';
import { getMeals, saveMeal, deleteMeal, initDB } from '../services/mealsService';
import { useSyncStatus } from '../contexts/SyncContext';

function Meals() {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { dataVersion } = useSyncStatus();

  useEffect(() => {
    loadMeals();
  }, [dataVersion]);

  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const checkScreenSize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const loadMeals = async () => {
    try {
      await initDB();
      const mealsList = await getMeals();
      // Only update state if data actually changed to prevent image flickering
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

  const handleSaveMeal = async (mealData) => {
    try {
      await saveMeal(mealData);
      await loadMeals();
      setShowForm(false);
      setEditingMeal(null);
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal. Please try again.');
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  const handleDeleteMeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(id);
        await loadMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Error deleting meal. Please try again.');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMeal(null);
  };

  // Get all unique tags for the autocomplete
  const allTags = [...new Set(meals.flatMap(meal => meal.tags || []))].sort();

  const filteredAndSortedMeals = useMemo(() => meals
    .filter(meal => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = meal.title?.toLowerCase().includes(searchLower) || false;
      const descriptionMatch = meal.description?.toLowerCase().includes(searchLower) || false;
      const searchMatch = titleMatch || descriptionMatch;

      // Tag filtering
      const tagMatch = selectedTags.length === 0 ||
        selectedTags.every(tag => meal.tags?.includes(tag));

      return searchMatch && tagMatch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue, bValue;

      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'freezerPortions':
          aValue = a.freezerPortions || 0;
          bValue = b.freezerPortions || 0;
          break;
        case 'lastEaten':
          aValue = a.lastEaten ? new Date(a.lastEaten).getTime() : 0;
          bValue = b.lastEaten ? new Date(b.lastEaten).getTime() : 0;
          break;
        case 'eatenCount':
          aValue = a.eatenCount || 0;
          bValue = b.eatenCount || 0;
          break;
        default:
          return 0;
      }

      if (sortField === 'title') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    }), [meals, searchTerm, selectedTags, sortField, sortDirection]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <UnfoldMoreIcon sx={{ fontSize: 16, opacity: 0.5 }} />;
    }
    return sortDirection === 'asc' ?
      <ArrowUpIcon sx={{ fontSize: 16 }} /> :
      <ArrowDownIcon sx={{ fontSize: 16 }} />;
  };

  const renderStars = (rating) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Rating
          value={rating}
          readOnly
          size="small"
          precision={1}
        />
        <Typography variant="body2" color="text.secondary">
          ({rating}/5)
        </Typography>
      </Box>
    );
  };

  const MealCard = ({ meal }) => {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Meal Image */}
            {meal.image ? (
              <Avatar
                src={meal.image}
                alt={meal.title}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 1
                }}
                variant="rounded"
              />
            ) : (
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  fontSize: '20px'
                }}
                variant="rounded"
              >
                🥘
              </Avatar>
            )}

            {/* Meal Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title and Version Count */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {meal.title}
                  </Typography>
                  {meal.versions && meal.versions.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {meal.versions.length} version{meal.versions.length !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    onClick={() => handleEditMeal(meal)}
                    color="primary"
                    size="small"
                    title="Edit meal"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteMeal(meal.id)}
                    color="error"
                    size="small"
                    title="Delete meal"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Rating */}
              <Box sx={{ mb: 1 }}>
                {renderStars(meal.rating)}
              </Box>

              {/* Description */}
              {meal.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {meal.description.length > 100 ?
                    meal.description.substring(0, 100) + '...' :
                    meal.description}
                </Typography>
              )}

              {/* Stats Row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fridge/Freezer:
                  </Typography>
                  <Typography variant="caption">
                    {meal.freezerPortions}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <RestaurantIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption">
                    {meal.eatenCount || 0} times
                  </Typography>
                </Box>

                {meal.lastEaten && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption">
                      {new Date(meal.lastEaten).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Web Link */}
              {meal.recipeUrl && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    component="a"
                    href={meal.recipeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    <LinkIcon fontSize="small" />
                    web link
                  </Typography>
                </Box>
              )}

              {/* Tags */}
              {meal.tags && meal.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {meal.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h5">Loading meals...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 3
      }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          My Meals
        </Typography>
        <Button
          onClick={() => setShowForm(true)}
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Add New Meal
        </Button>
      </Box>

      {meals.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <TextField
                placeholder="Search meals by title or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="medium"
                sx={{ width: 350, maxWidth: '100%' }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  )
                }}
              />

              <Autocomplete
                multiple
                options={allTags}
                value={selectedTags}
                onChange={(event, newValue) => setSelectedTags(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Filter by tags..."
                    size="medium"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <TagIcon sx={{ color: 'text.secondary', mr: 1 }} />
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
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                sx={{ width: 300, maxWidth: '100%' }}
              />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}>
                {(searchTerm || selectedTags.length > 0) && (
                  <Button
                    onClick={clearFilters}
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    color="inherit"
                  >
                    Clear Filters
                  </Button>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  {(searchTerm || selectedTags.length > 0) ? (
                    `${filteredAndSortedMeals.length} of ${meals.length} meals`
                  ) : (
                    `${meals.length} total meals`
                  )}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {meals.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6, border: '2px dashed', borderColor: 'grey.300', bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No meals saved yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first meal!
            </Typography>
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
            >
              Add Your First Meal
            </Button>
          </CardContent>
        </Card>
      ) : filteredAndSortedMeals.length === 0 && (searchTerm || selectedTags.length > 0) ? (
        <Card sx={{ textAlign: 'center', py: 6, border: '2px solid', borderColor: 'warning.main', bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" color="warning.dark" sx={{ mb: 1 }}>
              No meals found
            </Typography>
            <Typography variant="body1" color="warning.dark" sx={{ mb: 3 }}>
              No meals match your current filters
            </Typography>
            <Button
              onClick={clearFilters}
              variant="contained"
              color="warning"
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <Box>
          {filteredAndSortedMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  Image
                </TableCell>
                <TableCell
                  onClick={() => handleSort('title')}
                  sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: sortField === 'title' ? 'primary.light' : 'inherit',
                    '&:hover': {
                      bgcolor: sortField === 'title' ? 'primary.light' : 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Title
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSortIcon('title')}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  Description
                </TableCell>
                <TableCell
                  onClick={() => handleSort('rating')}
                  sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: sortField === 'rating' ? 'primary.light' : 'inherit',
                    '&:hover': {
                      bgcolor: sortField === 'rating' ? 'primary.light' : 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSortIcon('rating')}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  onClick={() => handleSort('freezerPortions')}
                  sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: sortField === 'freezerPortions' ? 'primary.light' : 'inherit',
                    '&:hover': {
                      bgcolor: sortField === 'freezerPortions' ? 'primary.light' : 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Fridge/Freezer Portions
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSortIcon('freezerPortions')}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  onClick={() => handleSort('lastEaten')}
                  sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: sortField === 'lastEaten' ? 'primary.light' : 'inherit',
                    '&:hover': {
                      bgcolor: sortField === 'lastEaten' ? 'primary.light' : 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Last Eaten
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSortIcon('lastEaten')}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  onClick={() => handleSort('eatenCount')}
                  sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: sortField === 'eatenCount' ? 'primary.light' : 'inherit',
                    '&:hover': {
                      bgcolor: sortField === 'eatenCount' ? 'primary.light' : 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Times Eaten
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSortIcon('eatenCount')}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedMeals.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell>
                    {meal.image ? (
                      <Box
                        component="img"
                        src={meal.image}
                        alt={meal.title}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    ) : (
                      <Box sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🥘
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {meal.title}
                      </Typography>
                      {meal.versions && meal.versions.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {meal.versions.length} version{meal.versions.length !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {meal.description ? (
                      <Typography variant="body2" color="text.secondary">
                        {meal.description.length > 100 ?
                          meal.description.substring(0, 100) + '...' :
                          meal.description}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                        No description
                      </Typography>
                    )}
                    {meal.recipeUrl && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          component="a"
                          href={meal.recipeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          <LinkIcon fontSize="small" />
                          web link
                        </Typography>
                      </Box>
                    )}
                    {meal.tags && meal.tags.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {meal.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderStars(meal.rating)}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {meal.freezerPortions}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {meal.lastEaten ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {new Date(meal.lastEaten).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                        Never eaten
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justify: 'center', gap: 1 }}>
                      <RestaurantIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Chip
                        label={meal.eatenCount || 0}
                        color={meal.eatenCount > 0 ? 'primary' : 'default'}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: '4px' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleEditMeal(meal)}
                        color="primary"
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark'
                          }
                        }}
                        title="Edit meal"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteMeal(meal.id)}
                        color="error"
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark'
                          }
                        }}
                        title="Delete meal"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {showForm && (
        <MealForm
          meal={editingMeal}
          onSave={handleSaveMeal}
          onCancel={handleCloseForm}
        />
      )}
    </Box>
  );
}

export default Meals;