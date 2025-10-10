import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

function SharedListInbox({
  sharedLists,
  loading,
  onAcceptList,
  onRejectList,
  onRefresh
}) {
  const [processingId, setProcessingId] = useState(null);
  const [previewDialog, setPreviewDialog] = useState({ open: false, list: null });
  const [mergeWithExisting, setMergeWithExisting] = useState(true);
  const [error, setError] = useState('');

  const handleAccept = async (sharedList) => {
    try {
      setProcessingId(sharedList.id);
      setError('');
      const result = await onAcceptList(sharedList.id, mergeWithExisting);

      // Show success message with details
      const message = `Added ${result.addedItems.length} items to your shopping list.${
        result.skippedItems.length > 0
          ? ` Skipped ${result.skippedItems.length} duplicate items.`
          : ''
      }`;

      // You might want to show this in a toast notification instead
      console.log('Shopping list accepted:', message);

      setPreviewDialog({ open: false, list: null });
    } catch (error) {
      console.error('Error accepting shared list:', error);
      setError(error.message || 'Failed to accept shared list. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (sharedList) => {
    try {
      setProcessingId(sharedList.id);
      setError('');
      await onRejectList(sharedList.id);
      setPreviewDialog({ open: false, list: null });
    } catch (error) {
      console.error('Error rejecting shared list:', error);
      setError(error.message || 'Failed to reject shared list. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePreview = (sharedList) => {
    setPreviewDialog({ open: true, list: sharedList });
    setError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const closePreview = () => {
    setPreviewDialog({ open: false, list: null });
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Card>
        <Box sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InboxIcon />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Shared Lists Inbox
            </Typography>
          </Box>
          <Chip
            label={sharedLists.length}
            color="inherit"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        <CardContent>
          {sharedLists.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
              <InboxIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">
                No shared shopping lists waiting.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                When someone shares a shopping list with you, it will appear here.
              </Typography>
            </Paper>
          ) : (
            <List sx={{ p: 0 }}>
              {sharedLists.map((sharedList, index) => (
                <React.Fragment key={sharedList.id}>
                  <ListItem
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      p: 2,
                      bgcolor: index % 2 === 0 ? 'transparent' : 'grey.50'
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {sharedList.list_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            From: {sharedList.sender_email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(sharedList.shared_at)}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        icon={<ShoppingCartIcon />}
                        label={`${sharedList.items.length} items`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      gap: 1,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Button
                        onClick={() => handlePreview(sharedList)}
                        variant="outlined"
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        Preview & Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(sharedList)}
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={processingId === sharedList.id}
                        startIcon={processingId === sharedList.id ? <CircularProgress size={16} /> : <RejectIcon />}
                        sx={{ flex: { xs: 1, sm: 'none' } }}
                      >
                        {processingId === sharedList.id ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </Box>
                  </ListItem>
                  {index < sharedLists.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={closePreview}
        maxWidth="sm"
        fullWidth
        aria-labelledby="preview-dialog-title"
      >
        <DialogTitle id="preview-dialog-title">
          Preview Shared Shopping List
        </DialogTitle>
        <DialogContent>
          {previewDialog.list && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {previewDialog.list.list_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  From: {previewDialog.list.sender_email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shared: {formatDate(previewDialog.list.shared_at)}
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Items ({previewDialog.list.items.length}):
              </Typography>

              <Paper sx={{ p: 2, mb: 3, maxHeight: 200, overflow: 'auto' }}>
                <List dense>
                  {previewDialog.list.items.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={item.item_name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: {
                            textDecoration: item.is_completed ? 'line-through' : 'none',
                            opacity: item.is_completed ? 0.6 : 1
                          }
                        }}
                      />
                      {item.is_completed && (
                        <Chip label="Completed" size="small" color="success" variant="outlined" />
                      )}
                    </ListItem>
                  ))}
                </List>
              </Paper>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={mergeWithExisting}
                    onChange={(e) => setMergeWithExisting(e.target.checked)}
                    color="primary"
                  />
                }
                label="Merge with existing shopping list (recommended)"
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                Items will be added to your current shopping list. Duplicates will be skipped.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => handleReject(previewDialog.list)}
            color="error"
            disabled={processingId === previewDialog.list?.id}
            startIcon={processingId === previewDialog.list?.id ? <CircularProgress size={16} /> : <RejectIcon />}
          >
            {processingId === previewDialog.list?.id ? 'Rejecting...' : 'Reject'}
          </Button>
          <Button
            onClick={() => handleAccept(previewDialog.list)}
            variant="contained"
            disabled={processingId === previewDialog.list?.id}
            startIcon={processingId === previewDialog.list?.id ? <CircularProgress size={16} /> : <AcceptIcon />}
          >
            {processingId === previewDialog.list?.id ? 'Accepting...' : 'Accept'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SharedListInbox;