import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Rating, FormControl, FormLabel, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Autocomplete } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Add as AddIcon, Delete as DeleteIcon, Link as LinkIcon } from '@mui/icons-material';
import { getMeals } from '../services/mealsService';

function MealForm({ meal = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: 1,
    freezerPortions: 0,
    image: '',
    recipeUrl: '',
    versions: [],
    tags: []
  });
  const [newVersion, setNewVersion] = useState('');
  const [newTag, setNewTag] = useState('');
  const [allExistingTags, setAllExistingTags] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meal) {
      setFormData({
        title: meal.title || '',
        description: meal.description || '',
        rating: meal.rating || 1,
        freezerPortions: meal.freezerPortions || 0,
        image: meal.image || '',
        recipeUrl: meal.recipeUrl || '',
        versions: meal.versions || [],
        tags: meal.tags || []
      });
    }
  }, [meal]);

  useEffect(() => {
    // Load all existing tags for autocomplete
    const loadExistingTags = async () => {
      try {
        const meals = await getMeals();
        const allTags = [...new Set(meals.flatMap(m => m.tags || []))].sort();
        setAllExistingTags(allTags);
      } catch (error) {
        console.error('Error loading existing tags:', error);
      }
    };
    loadExistingTags();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'freezerPortions' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddVersion = () => {
    if (newVersion.trim()) {
      setFormData(prev => ({
        ...prev,
        versions: [...prev.versions, newVersion.trim()]
      }));
      setNewVersion('');
    }
  };

  const handleDeleteVersion = (index) => {
    setFormData(prev => ({
      ...prev,
      versions: prev.versions.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleDeleteTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleVersionKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVersion();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!formData.title.trim()) {
      alert('Please enter a meal title');
      return;
    }

    // Check for duplicate title (only when creating new meals)
    if (!meal) {
      const existingMeals = await getMeals();
      const duplicate = existingMeals.find(
        m => m.title.toLowerCase() === formData.title.trim().toLowerCase()
      );
      if (duplicate) {
        alert('A meal with this title already exists.');
        return;
      }
    }

    setSaving(true);

    // Auto-add pending version if text field is not empty
    let finalFormData = { ...formData };
    if (newVersion.trim()) {
      finalFormData.versions = [...finalFormData.versions, newVersion.trim()];
    }

    // Auto-add pending tag if text field is not empty
    if (newTag.trim()) {
      finalFormData.tags = [...finalFormData.tags, newTag.trim()];
    }

    const mealData = {
      ...finalFormData,
      id: meal?.id
    };

    onSave(mealData);
  };


  return (
    <Dialog
      open={true}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {meal ? 'Edit Meal' : 'Add New Meal'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          <TextField
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            variant="outlined"
          />

          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
          />

          <TextField
            name="recipeUrl"
            label="Recipe URL"
            value={formData.recipeUrl}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="https://example.com/recipe"
            InputProps={{
              startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            helperText="Optional: Link to the recipe website"
          />

          <FormControl sx={{ mt: 2, mb: 2 }}>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
              Rating
            </FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, rating: newValue || 1 }));
                }}
                size="large"
              />
              <Typography variant="body2" color="text.secondary">
                {formData.rating} out of 5
              </Typography>
            </Box>
          </FormControl>

          <TextField
            name="freezerPortions"
            label={`${formData.freezerPortions === 1 ? 'Portion' : 'Portions'} in Fridge/Freezer`}
            type="number"
            value={formData.freezerPortions}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ min: 0 }}
          />

          <TextField
            name="image"
            label="Image URL"
            value={formData.image}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="https://example.com/image.jpg"
            helperText="Paste a URL to an image"
          />
          {formData.image && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Box
                component="img"
                src={formData.image}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'grey.300'
                }}
              />
            </Box>
          )}

          <FormControl sx={{ mt: 3, mb: 2 }} fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
              Meal Versions
            </FormLabel>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add different variations of this meal (e.g., "with brown rice", "on zucchini noodles")
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                onKeyPress={handleVersionKeyPress}
                placeholder="Enter version name..."
                size="small"
                fullWidth
              />
              <Button
                onClick={handleAddVersion}
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={!newVersion.trim()}
              >
                Add
              </Button>
            </Box>

            {formData.versions.length > 0 && (
              <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, overflow: 'hidden' }}>
                <List dense>
                  {formData.versions.map((version, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={version} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteVersion(index)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < formData.versions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </FormControl>

          <FormControl sx={{ mt: 3, mb: 2 }} fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
              Tags
            </FormLabel>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add tags to categorize your meals (e.g., "vegetarian", "quick", "comfort food")
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Autocomplete
                freeSolo
                options={allExistingTags.filter(tag => !formData.tags.includes(tag))}
                value={newTag}
                onInputChange={(event, newValue) => setNewTag(newValue)}
                onChange={(event, newValue) => {
                  if (newValue && typeof newValue === 'string') {
                    setNewTag(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select existing tag or type new one..."
                    size="small"
                    onKeyPress={handleTagKeyPress}
                  />
                )}
                sx={{ flexGrow: 1 }}
              />
              <Button
                onClick={handleAddTag}
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </Box>

            {formData.tags.length > 0 && (
              <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, overflow: 'hidden' }}>
                <List dense>
                  {formData.tags.map((tag, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={tag} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteTag(index)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < formData.tags.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </FormControl>

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          startIcon={<CancelIcon />}
          size="large"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          size="large"
          disabled={saving}
        >
          {saving ? 'Saving...' : meal ? 'Update Meal' : 'Save Meal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MealForm;