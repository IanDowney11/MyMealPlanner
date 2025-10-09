import React, { useState, useEffect } from 'react';
import { Button, IconButton, Typography, Card, CardContent, Box, TextField, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Rating } from '@mui/material';
import { Add as AddIcon, Clear as ClearIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, UnfoldMore as UnfoldMoreIcon, KeyboardArrowUp as ArrowUpIcon, KeyboardArrowDown as ArrowDownIcon, Schedule as ScheduleIcon, Restaurant as RestaurantIcon } from '@mui/icons-material';
import MealForm from '../components/MealForm';
import { getMeals, saveMeal, deleteMeal, initDB } from '../services/mealsService';

function Meals() {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    loadMeals();
  }, []);

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

  const filteredAndSortedMeals = meals
    .filter(meal => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = meal.title?.toLowerCase().includes(searchLower) || false;
      const descriptionMatch = meal.description?.toLowerCase().includes(searchLower) || false;
      return titleMatch || descriptionMatch;
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
    });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
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

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}>
                {searchTerm && (
                  <Button
                    onClick={clearSearch}
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    color="inherit"
                  >
                    Clear
                  </Button>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  {searchTerm ? (
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
      ) : filteredAndSortedMeals.length === 0 && searchTerm ? (
        <Card sx={{ textAlign: 'center', py: 6, border: '2px solid', borderColor: 'warning.main', bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" color="warning.dark" sx={{ mb: 1 }}>
              No meals found
            </Typography>
            <Typography variant="body1" color="warning.dark" sx={{ mb: 3 }}>
              No meals match your search for "{searchTerm}"
            </Typography>
            <Button
              onClick={clearSearch}
              variant="contained"
              color="warning"
              startIcon={<ClearIcon />}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                      Freezer Portions
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {meal.title}
                    </Typography>
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
                  </TableCell>
                  <TableCell>
                    {renderStars(meal.rating)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={meal.freezerPortions}
                      color={meal.freezerPortions > 0 ? 'success' : 'error'}
                      variant="filled"
                      size="small"
                    />
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
                      <Button
                        onClick={() => handleEditMeal(meal)}
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteMeal(meal.id)}
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
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