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
  Alert,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';

function EventModal({ open, onClose, onSave, event = null, selectedDate = null }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'one-time',
    date: '',
    monthlyPattern: 'date', // 'date' or 'day-of-week'
    monthlyWeek: 'first', // 'first', 'second', 'third', 'fourth', 'last'
    monthlyDayOfWeek: 0 // 0-6 (Sunday-Saturday)
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title || '',
        type: event.type || 'one-time',
        date: event.date || '',
        monthlyPattern: event.monthlyPattern || 'date',
        monthlyWeek: event.monthlyWeek || 'first',
        monthlyDayOfWeek: event.monthlyDayOfWeek ?? 0
      });
    } else if (selectedDate) {
      // Creating new event with pre-selected date
      const dateStr = typeof selectedDate === 'string'
        ? selectedDate
        : selectedDate.toISOString().split('T')[0];

      // Calculate the day of week and week number from selected date
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);

      let monthlyWeek = 'first';
      if (weekNumber === 2) monthlyWeek = 'second';
      else if (weekNumber === 3) monthlyWeek = 'third';
      else if (weekNumber === 4) monthlyWeek = 'fourth';
      else if (weekNumber >= 5) monthlyWeek = 'last';

      setFormData({
        title: '',
        type: 'one-time',
        date: dateStr,
        monthlyPattern: 'date',
        monthlyWeek: monthlyWeek,
        monthlyDayOfWeek: dayOfWeek
      });
    } else {
      // Creating new event
      setFormData({
        title: '',
        type: 'one-time',
        date: '',
        monthlyPattern: 'date',
        monthlyWeek: 'first',
        monthlyDayOfWeek: 0
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
      date: '',
      monthlyPattern: 'date',
      monthlyWeek: 'first',
      monthlyDayOfWeek: 0
    });
    setErrors({});
    onClose();
  };

  // Helper function to get readable description of monthly event
  const getMonthlyDescription = () => {
    if (!formData.date) return '';

    const date = new Date(formData.date);
    const dayOfMonth = date.getDate();

    if (formData.monthlyPattern === 'date') {
      return `This event will occur on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)} of every month.`;
    } else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weekNames = {
        'first': 'first',
        'second': 'second',
        'third': 'third',
        'fourth': 'fourth',
        'last': 'last'
      };
      const dayName = dayNames[formData.monthlyDayOfWeek];
      const weekName = weekNames[formData.monthlyWeek];
      return `This event will occur on the ${weekName} ${dayName} of every month.`;
    }
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
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
              <FormControlLabel
                value="monthly"
                control={<Radio />}
                label="Monthly recurring"
              />
            </RadioGroup>
          </FormControl>

          {formData.type === 'monthly' && (
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 1 }}>Monthly Pattern</FormLabel>
              <RadioGroup
                value={formData.monthlyPattern}
                onChange={handleChange('monthlyPattern')}
              >
                <FormControlLabel
                  value="date"
                  control={<Radio />}
                  label="Same date each month (e.g., 15th of every month)"
                />
                <FormControlLabel
                  value="day-of-week"
                  control={<Radio />}
                  label="Same day of week each month (e.g., first Tuesday)"
                />
              </RadioGroup>
            </FormControl>
          )}

          {formData.type === 'monthly' && formData.monthlyPattern === 'day-of-week' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Week of Month</InputLabel>
                <Select
                  value={formData.monthlyWeek}
                  onChange={handleChange('monthlyWeek')}
                  label="Week of Month"
                >
                  <MenuItem value="first">First</MenuItem>
                  <MenuItem value="second">Second</MenuItem>
                  <MenuItem value="third">Third</MenuItem>
                  <MenuItem value="fourth">Fourth</MenuItem>
                  <MenuItem value="last">Last</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.monthlyDayOfWeek}
                  onChange={handleChange('monthlyDayOfWeek')}
                  label="Day of Week"
                >
                  <MenuItem value={0}>Sunday</MenuItem>
                  <MenuItem value={1}>Monday</MenuItem>
                  <MenuItem value={2}>Tuesday</MenuItem>
                  <MenuItem value={3}>Wednesday</MenuItem>
                  <MenuItem value={4}>Thursday</MenuItem>
                  <MenuItem value={5}>Friday</MenuItem>
                  <MenuItem value={6}>Saturday</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            error={!!errors.date}
            helperText={
              errors.date ||
              (formData.type === 'weekly' ? 'Choose any date with the day of the week you want' : '') ||
              (formData.type === 'monthly' && formData.monthlyPattern === 'date' ? 'Choose a date with the day of the month you want' : '')
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />

          {formData.type === 'weekly' && (
            <Alert severity="info">
              This event will appear every week on {formData.date ? new Date(formData.date).toLocaleDateString(undefined, { weekday: 'long' }) : 'the selected day'}.
            </Alert>
          )}

          {formData.type === 'monthly' && formData.date && (
            <Alert severity="info">
              {getMonthlyDescription()}
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