import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { getSnacks } from '../services/snacksService';

function SnackForm({ snack = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (snack) {
      setFormData({
        title: snack.title || '',
        description: snack.description || '',
        image: snack.image || ''
      });
    }
  }, [snack]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!formData.title.trim()) {
      alert('Please enter a snack title');
      return;
    }

    // Check for duplicate title (only when creating new snacks)
    if (!snack) {
      const existingSnacks = await getSnacks();
      const duplicate = existingSnacks.find(
        s => s.title.toLowerCase() === formData.title.trim().toLowerCase()
      );
      if (duplicate) {
        alert('A snack with this title already exists.');
        return;
      }
    }

    setSaving(true);

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
          {saving ? 'Saving...' : snack ? 'Update Snack' : 'Save Snack'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SnackForm;