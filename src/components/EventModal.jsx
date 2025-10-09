import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert
} from '@mui/material';

function EventModal({ open, onClose, onSave, event = null, selectedDate = null }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'one-time',
    date: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title || '',
        type: event.type || 'one-time',
        date: event.date || ''
      });
    } else if (selectedDate) {
      // Creating new event with pre-selected date
      const dateStr = typeof selectedDate === 'string'
        ? selectedDate
        : selectedDate.toISOString().split('T')[0];
      setFormData({
        title: '',
        type: 'one-time',
        date: dateStr
      });
    } else {
      // Creating new event
      setFormData({
        title: '',
        type: 'one-time',
        date: ''
      });
    }
    setErrors({});
  }, [event, selectedDate, open]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const eventData = {
      ...formData,
      title: formData.title.trim(),
      id: event?.id || undefined // Keep existing ID if editing, let storage generate for new events
    };

    onSave(eventData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      type: 'one-time',
      date: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {event ? 'Edit Event' : 'Add New Event'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <TextField
            label="Event Title"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            autoFocus
          />

          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1 }}>Event Type</FormLabel>
            <RadioGroup
              value={formData.type}
              onChange={handleChange('type')}
              row
            >
              <FormControlLabel
                value="one-time"
                control={<Radio />}
                label="One-time event"
              />
              <FormControlLabel
                value="weekly"
                control={<Radio />}
                label="Weekly recurring"
              />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            error={!!errors.date}
            helperText={errors.date || (formData.type === 'weekly' ? 'Choose any date with the day of the week you want' : '')}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />

          {formData.type === 'weekly' && (
            <Alert severity="info" sx={{ mt: 1 }}>
              This event will appear every week on {formData.date ? new Date(formData.date).toLocaleDateString(undefined, { weekday: 'long' }) : 'the selected day'}.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
        >
          {event ? 'Update' : 'Create'} Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EventModal;