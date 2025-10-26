import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Rating, FormControl, FormLabel, Input, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Autocomplete, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, CloudUpload as UploadIcon, Add as AddIcon, Delete as DeleteIcon, Link as LinkIcon } from '@mui/icons-material';
import { getMeals } from '../services/mealsService';
import { processImageFile } from '../utils/imageUtils';

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
  const [imagePreview, setImagePreview] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [newTag, setNewTag] = useState('');
  const [allExistingTags, setAllExistingTags] = useState([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    const loadAndResizeMeal = async () => {
      if (meal) {
        // Check if the existing image needs resizing
        let processedImage = meal.image || '';

        if (meal.image && meal.image.startsWith('data:image')) {
          try {
            // Check if image is larger than 50KB
            const base64String = meal.image.split(',')[1];
            const sizeInBytes = (base64String.length * 3) / 4;
            const sizeInKB = sizeInBytes / 1024;

            // If image is larger than 50KB, resize it
            if (sizeInKB > 50) {
              console.log(`Existing image is ${sizeInKB.toFixed(2)}KB, resizing to 50KB...`);
              setIsProcessingImage(true);
              const { resizeImageToMaxSize } = await import('../utils/imageUtils');
              processedImage = await resizeImageToMaxSize(meal.image, 50);
              console.log('Image resized successfully');
            }
          } catch (error) {
            console.error('Error resizing existing image:', error);
            // Keep original image if resize fails
            processedImage = meal.image;
          } finally {
            setIsProcessingImage(false);
          }
        }

        setFormData({
          title: meal.title || '',
          description: meal.description || '',
          rating: meal.rating || 1,
          freezerPortions: meal.freezerPortions || 0,
          image: processedImage,
          recipeUrl: meal.recipeUrl || '',
          versions: meal.versions || [],
          tags: meal.tags || []
        });
        setImagePreview(processedImage);
      }
    };

    loadAndResizeMeal();
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsProcessingImage(true);

        // Process and resize image to max 50KB
        const resizedImageData = await processImageFile(file, 50);

        setFormData(prev => ({ ...prev, image: resizedImageData }));
        setImagePreview(resizedImageData);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try a different image.');
      } finally {
        setIsProcessingImage(false);
      }
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a meal title');
      return;
    }

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

          <FormControl sx={{ mt: 2, mb: 2 }} fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
              Image
            </FormLabel>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Images are automatically resized to max 50KB for optimal performance
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={isProcessingImage ? <CircularProgress size={20} /> : <UploadIcon />}
              disabled={isProcessingImage}
              sx={{ mb: 2 }}
            >
              {isProcessingImage ? 'Processing...' : 'Choose Image'}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                sx={{ display: 'none' }}
                disabled={isProcessingImage}
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 1 }}>
                <Box
                  component="img"
                  src={imagePreview}
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
          </FormControl>

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
        >
          {meal ? 'Update Meal' : 'Save Meal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MealForm;