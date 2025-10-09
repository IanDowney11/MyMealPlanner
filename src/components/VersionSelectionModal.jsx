import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Check as CheckIcon
} from '@mui/icons-material';

function VersionSelectionModal({ meal, open, onClose, onSelect }) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  if (!meal || !open) return null;

  const handleSelect = () => {
    if (onSelect) {
      onSelect(selectedVersion);
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedVersion(null);
    onClose();
  };

  const versions = meal.versions || [];
  const hasVersions = versions.length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RestaurantIcon color="primary" />
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Select Meal Version
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {meal.title}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {hasVersions ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which version of this meal you'd like to add to your plan:
            </Typography>

            <List>
              {/* Original meal option */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setSelectedVersion(null)}
                  selected={selectedVersion === null}
                  sx={{ borderRadius: 1, mb: 1 }}
                >
                  <ListItemIcon>
                    {selectedVersion === null && <CheckIcon color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary="Original"
                    secondary="The basic version of this meal"
                  />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />

              {/* Version options */}
              {versions.map((version, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => setSelectedVersion(version)}
                    selected={selectedVersion === version}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      {selectedVersion === version && <CheckIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={version}
                      secondary={`${meal.title} ${version}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            This meal has no versions. The original meal will be added to your plan.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSelect}
          variant="contained"
          disabled={hasVersions && selectedVersion === undefined}
        >
          Add to Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VersionSelectionModal;