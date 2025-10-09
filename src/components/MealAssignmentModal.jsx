import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Rating,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import VersionSelectionModal from './VersionSelectionModal';

function MealAssignmentModal({
  open,
  onClose,
  meal,
  weekDates,
  weeklyPlan,
  onAssignMeal,
  formatDisplayDate
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  if (!meal) return null;

  const handleDateSelect = async (date) => {
    const hasVersions = meal.versions && meal.versions.length > 0;

    if (hasVersions) {
      // Show version selection modal
      setSelectedDate(date);
      setVersionModalOpen(true);
    } else {
      // Assign meal directly
      try {
        await onAssignMeal(date, meal, null);
        onClose();
      } catch (error) {
        console.error('Error assigning meal:', error);
      }
    }
  };

  const handleVersionSelect = async (selectedVersion) => {
    try {
      await onAssignMeal(selectedDate, meal, selectedVersion);
      setVersionModalOpen(false);
      setSelectedDate(null);
      onClose();
    } catch (error) {
      console.error('Error assigning meal with version:', error);
    }
  };

  const handleVersionModalClose = () => {
    setVersionModalOpen(false);
    setSelectedDate(null);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, m: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Schedule Meal
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Selected Meal Display */}
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {meal.image ? (
                <Avatar
                  src={meal.image}
                  alt={meal.title}
                  sx={{ width: 60, height: 60, borderRadius: 1 }}
                  variant="rounded"
                />
              ) : (
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    fontSize: '24px'
                  }}
                  variant="rounded"
                >
                  🥘
                </Avatar>
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {meal.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={meal.rating || 0} readOnly size="small" />
                </Box>
                {meal.freezerPortions > 0 && (
                  <Chip
                    label={`${meal.freezerPortions} ${meal.freezerPortions === 1 ? 'portion' : 'portions'} in freezer`}
                    color="success"
                    size="small"
                    sx={{ fontSize: '12px' }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Week Selection */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Choose a day:
        </Typography>

        <Grid container spacing={2}>
          {weekDates.map((date) => {
            const dateStr = formatDate(date);
            const hasPlannedMeal = weeklyPlan[dateStr];
            const isToday = formatDate(new Date()) === dateStr;

            return (
              <Grid item xs={12} key={dateStr}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: isToday ? 'primary.main' : 'divider',
                    transition: 'all 0.2s ease',
                    bgcolor: hasPlannedMeal ? 'warning.light' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => handleDateSelect(date)}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {formatDisplayDate(date)}
                        </Typography>
                        {hasPlannedMeal && (
                          <Typography variant="body2" color="warning.dark" sx={{ mt: 0.5 }}>
                            ⚠️ Will replace: {hasPlannedMeal.meal?.title || hasPlannedMeal.title}
                          </Typography>
                        )}
                      </Box>
                      {isToday && (
                        <Chip label="Today" color="primary" size="small" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Cancel
        </Button>
      </DialogActions>

      {/* Version Selection Modal */}
      <VersionSelectionModal
        meal={meal}
        open={versionModalOpen}
        onClose={handleVersionModalClose}
        onSelect={handleVersionSelect}
      />
    </Dialog>
  );
}

export default MealAssignmentModal;