import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, FormControl, FormLabel, Input, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { processImageFile } from '../utils/imageUtils';

function SnackForm({ snack = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    const loadAndResizeSnack = async () => {
      if (snack) {
        // Check if the existing image needs resizing
        let processedImage = snack.image || '';

        if (snack.image && snack.image.startsWith('data:image')) {
          try {
            // Check if image is larger than 50KB
            const base64String = snack.image.split(',')[1];
            const sizeInBytes = (base64String.length * 3) / 4;
            const sizeInKB = sizeInBytes / 1024;

            // If image is larger than 50KB, resize it
            if (sizeInKB > 50) {
              console.log(`Existing image is ${sizeInKB.toFixed(2)}KB, resizing to 50KB...`);
              setIsProcessingImage(true);
              const { resizeImageToMaxSize } = await import('../utils/imageUtils');
              processedImage = await resizeImageToMaxSize(snack.image, 50);
              console.log('Image resized successfully');
            }
          } catch (error) {
            console.error('Error resizing existing image:', error);
            // Keep original image if resize fails
            processedImage = snack.image;
          } finally {
            setIsProcessingImage(false);
          }
        }

        setFormData({
          title: snack.title || '',
          description: snack.description || '',
          image: processedImage
        });
        setImagePreview(processedImage);
      }
    };

    loadAndResizeSnack();
  }, [snack]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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