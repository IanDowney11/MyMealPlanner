import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

function SharingPermissions({
  permissions,
  loading,
  onAddPermission,
  onDeletePermission,
  onRefresh
}) {
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, permission: null });

  const handleAddPermission = async () => {
    if (!newSenderEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSenderEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setAdding(true);
      setError('');
      await onAddPermission(newSenderEmail.trim());
      setNewSenderEmail('');
    } catch (error) {
      console.error('Error adding permission:', error);
      setError(error.message || 'Failed to add permission. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (permission) => {
    setConfirmDialog({ open: true, permission });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.permission) return;

    try {
      await onDeletePermission(confirmDialog.permission.id);
      setConfirmDialog({ open: false, permission: null });
    } catch (error) {
      console.error('Error deleting permission:', error);
      setError('Failed to delete permission. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddPermission();
    }
  };

  const clearError = () => setError('');

  return (
    <Card>
      <Box sx={{
        bgcolor: 'primary.main',
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <SecurityIcon />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Sharing Permissions
        </Typography>
      </Box>

      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          Manage who can send you shopping lists. Only users you've given permission to
          can share their shopping lists with you.
        </Typography>

        {/* Add Permission Form */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Grant Permission to New User
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <TextField
              fullWidth
              value={newSenderEmail}
              onChange={(e) => {
                setNewSenderEmail(e.target.value);
                if (error) clearError();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter email address..."
              variant="outlined"
              size="small"
              disabled={adding}
              error={!!error}
              helperText={error}
              InputProps={{
                startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
              }}
            />
            <Button
              onClick={handleAddPermission}
              variant="contained"
              startIcon={adding ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              disabled={!newSenderEmail.trim() || adding}
              sx={{
                whiteSpace: 'nowrap',
                minWidth: { xs: '100%', sm: 'auto' }
              }}
            >
              {adding ? 'Adding...' : 'Add Permission'}
            </Button>
          </Box>
        </Box>

        {/* Permissions List */}
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Allowed Users ({permissions.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : permissions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
            <ShareIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              No sharing permissions set up yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add email addresses above to allow users to share shopping lists with you.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <List>
              {permissions.map((permission, index) => (
                <React.Fragment key={permission.id}>
                  <ListItem>
                    <ListItemText
                      primary={permission.sender_email}
                      secondary={`Added ${new Date(permission.created_at).toLocaleDateString()}`}
                      primaryTypographyProps={{
                        variant: 'body1',
                        sx: { fontWeight: 500 }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(permission)}
                        color="error"
                        size="small"
                        sx={{
                          opacity: 0.7,
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < permissions.length - 1 && (
                    <Box sx={{ px: 2 }}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />
                    </Box>
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Info Alert */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>How it works:</strong> When you add someone's email address here,
            they'll be able to share their shopping lists with you. The items will either
            create a new shopping list or be added to your existing one (avoiding duplicates).
          </Typography>
        </Alert>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, permission: null })}
        aria-labelledby="confirm-delete-dialog"
      >
        <DialogTitle id="confirm-delete-dialog">
          Remove Sharing Permission?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove sharing permission for{' '}
            <strong>{confirmDialog.permission?.sender_email}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            They will no longer be able to share shopping lists with you.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, permission: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Remove Permission
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default SharingPermissions;