import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, FormControl, FormLabel, Input } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, CloudUpload as UploadIcon } from '@mui/icons-material';

function SnackForm({ snack = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (snack) {
      setFormData({
        title: snack.title || '',
        description: snack.description || '',
        image: snack.image || ''
      });
      setImagePreview(snack.image || '');
    }
  }, [snack]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a snack title');
      return;
    }

    const snackData = {
      ...formData,
      id: snack?.id
    };

    onSave(snackData);
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
          {snack ? 'Edit Snack' : 'Add New Snack'}
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
          {snack ? 'Update Snack' : 'Save Snack'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SnackForm;