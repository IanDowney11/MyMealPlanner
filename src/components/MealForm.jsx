import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Rating, FormControl, FormLabel, Input, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, CloudUpload as UploadIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

function MealForm({ meal = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: 1,
    freezerPortions: 0,
    image: '',
    versions: []
  });
  const [imagePreview, setImagePreview] = useState('');
  const [newVersion, setNewVersion] = useState('');

  useEffect(() => {
    if (meal) {
      setFormData({
        title: meal.title || '',
        description: meal.description || '',
        rating: meal.rating || 1,
        freezerPortions: meal.freezerPortions || 0,
        image: meal.image || '',
        versions: meal.versions || []
      });
      setImagePreview(meal.image || '');
    }
  }, [meal]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'freezerPortions' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setFormData(prev => ({ ...prev, image: imageData }));
        setImagePreview(imageData);
      };
      reader.readAsDataURL(file);
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

    const mealData = {
      ...formData,
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
            label={`${formData.freezerPortions === 1 ? 'Portion' : 'Portions'} in Freezer`}
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
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              Choose Image
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                sx={{ display: 'none' }}
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