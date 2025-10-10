import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Divider,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  PlaylistAdd as PlaylistAddIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Inbox as InboxIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import {
  getFrequentItems,
  addFrequentItem,
  deleteFrequentItem,
  getCurrentShoppingList,
  createShoppingList,
  deleteShoppingList,
  addItemToShoppingList,
  toggleShoppingListItem,
  deleteShoppingListItem,
  initDB
} from '../services/shoppingListService';
import {
  getSharingPermissions,
  addSharingPermission,
  deleteSharingPermission,
  shareShoppingList,
  getReceivedSharedLists,
  acceptSharedList,
  rejectSharedList,
  initSharingDB
} from '../services/sharingService';
import SharingPermissions from '../components/SharingPermissions';
import SharedListInbox from '../components/SharedListInbox';

function ShoppingList() {
  // Main state
  const [frequentItems, setFrequentItems] = useState([]);
  const [shoppingList, setShoppingList] = useState(null);
  const [newFrequentItem, setNewFrequentItem] = useState('');
  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingFrequent, setAddingFrequent] = useState(false);
  const [addingShopping, setAddingShopping] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

  // Sharing state
  const [tabValue, setTabValue] = useState(0);
  const [sharingPermissions, setSharingPermissions] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [shareDialog, setShareDialog] = useState({ open: false });
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadData();
    loadSharingData();
  }, []);

  const loadData = async () => {
    try {
      await initDB();
      const [frequentData, shoppingData] = await Promise.all([
        getFrequentItems(),
        getCurrentShoppingList()
      ]);
      setFrequentItems(frequentData);
      setShoppingList(shoppingData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSharingData = async () => {
    try {
      setSharingLoading(true);
      await initSharingDB();
      const [permissionsData, sharedListsData] = await Promise.all([
        getSharingPermissions(),
        getReceivedSharedLists()
      ]);
      setSharingPermissions(permissionsData);
      setSharedLists(sharedListsData);
    } catch (error) {
      console.error('Error loading sharing data:', error);
    } finally {
      setSharingLoading(false);
    }
  };

  const handleAddFrequentItem = async () => {
    if (!newFrequentItem.trim()) return;

    // Check for duplicates (case insensitive)
    const itemNameLower = newFrequentItem.trim().toLowerCase();
    const isDuplicate = frequentItems.some(
      item => item.item_name.toLowerCase() === itemNameLower
    );

    if (isDuplicate) {
      alert('This item is already in your frequent items list.');
      return;
    }

    try {
      setAddingFrequent(true);
      await addFrequentItem(newFrequentItem);
      setNewFrequentItem('');
      await loadData();
    } catch (error) {
      console.error('Error adding frequent item:', error);
      alert('Error adding frequent item. Please try again.');
    } finally {
      setAddingFrequent(false);
    }
  };

  const handleDeleteFrequentItem = async (id) => {
    try {
      await deleteFrequentItem(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting frequent item:', error);
      alert('Error deleting frequent item. Please try again.');
    }
  };

  const handleCreateShoppingList = async () => {
    try {
      setCreatingList(true);
      await createShoppingList();
      await loadData();
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Error creating shopping list. Please try again.');
    } finally {
      setCreatingList(false);
    }
  };

  const handleAddToShoppingList = async (itemName) => {
    try {
      // Check for duplicates in shopping list (case insensitive)
      if (shoppingList) {
        const itemNameLower = itemName.trim().toLowerCase();
        const isDuplicate = shoppingItems.some(
          item => item.item_name.toLowerCase() === itemNameLower
        );

        if (isDuplicate) {
          alert('This item is already in your shopping list.');
          return;
        }
      }

      if (!shoppingList) {
        await handleCreateShoppingList();
        const newList = await getCurrentShoppingList();
        await addItemToShoppingList(newList.id, itemName);
      } else {
        await addItemToShoppingList(shoppingList.id, itemName);
      }
      await loadData();
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      alert('Error adding item to shopping list. Please try again.');
    }
  };

  const handleAddNewShoppingItem = async () => {
    if (!newShoppingItem.trim()) return;

    try {
      setAddingShopping(true);
      await handleAddToShoppingList(newShoppingItem);
      setNewShoppingItem('');
    } catch (error) {
      console.error('Error adding new shopping item:', error);
      alert('Error adding new shopping item. Please try again.');
    } finally {
      setAddingShopping(false);
    }
  };

  const handleToggleShoppingItem = async (id, currentStatus) => {
    try {
      await toggleShoppingListItem(id, !currentStatus);
      await loadData();
    } catch (error) {
      console.error('Error toggling shopping item:', error);
      alert('Error updating shopping item. Please try again.');
    }
  };

  const handleDeleteShoppingItem = async (id) => {
    try {
      await deleteShoppingListItem(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      alert('Error deleting shopping item. Please try again.');
    }
  };

  const handleCompleteShoppingList = async () => {
    if (!shoppingList) return;

    if (window.confirm('Mark shopping list as complete? This will delete the entire list.')) {
      try {
        await deleteShoppingList(shoppingList.id);
        await loadData();
      } catch (error) {
        console.error('Error completing shopping list:', error);
        alert('Error completing shopping list. Please try again.');
      }
    }
  };

  const handleFrequentKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddFrequentItem();
    }
  };

  const handleShoppingKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddNewShoppingItem();
    }
  };

  // Sharing handlers
  const handleAddSharingPermission = async (senderEmail) => {
    await addSharingPermission(senderEmail);
    await loadSharingData();
  };

  const handleDeleteSharingPermission = async (permissionId) => {
    await deleteSharingPermission(permissionId);
    await loadSharingData();
  };

  const handleShareList = async () => {
    if (!shoppingList || !shareEmail.trim()) return;

    try {
      setSharing(true);
      await shareShoppingList(
        shareEmail.trim(),
        shoppingList.shopping_list_items || [],
        shoppingList.name || 'Shopping List'
      );
      setShareDialog({ open: false });
      setShareEmail('');
      alert('Shopping list shared successfully!');
    } catch (error) {
      console.error('Error sharing list:', error);
      alert(error.message || 'Failed to share shopping list. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleAcceptSharedList = async (sharedListId, mergeWithExisting) => {
    const result = await acceptSharedList(sharedListId, mergeWithExisting);
    await loadSharingData();
    await loadData(); // Refresh shopping list if items were added
    return result;
  };

  const handleRejectSharedList = async (sharedListId) => {
    await rejectSharedList(sharedListId);
    await loadSharingData();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const shoppingItems = shoppingList?.shopping_list_items || [];
  const pendingItems = shoppingItems.filter(item => !item.is_completed);
  const completedItems = shoppingItems.filter(item => item.is_completed);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h5">Loading shopping list...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4, textAlign: 'center' }}>
        Shopping Lists
      </Typography>

      {/* Mobile-first layout: Shopping List first, then Frequent Items */}
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Shopping List Section - First on mobile */}
        <Box sx={{ flex: 1, order: { xs: 1, md: 2 } }}>
          <Card sx={{ mb: { xs: 4, md: 0 } }}>
            <Box sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon />
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  Active Shopping List
                </Typography>
              </Box>
              {shoppingList && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    onClick={() => setShareDialog({ open: true })}
                    variant="contained"
                    color="inherit"
                    startIcon={<ShareIcon />}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Share
                  </Button>
                  <Button
                    onClick={handleCompleteShoppingList}
                    variant="contained"
                    color="inherit"
                    startIcon={<CheckCircleIcon />}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Complete
                  </Button>
                </Box>
              )}
            </Box>
            <CardContent>
              {!shoppingList ? (
                <Box sx={{ textAlign: 'center', py: { xs: 4, md: 6 } }}>
                  <Typography sx={{ fontSize: '48px', mb: 2 }}>🛒</Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No active shopping list
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create a new shopping list to start adding items!
                  </Typography>
                  <Button
                    onClick={handleCreateShoppingList}
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={creatingList}
                    fullWidth={true}
                    sx={{
                      maxWidth: { xs: '100%', sm: 'auto' },
                      mb: { xs: 2, sm: 0 }
                    }}
                  >
                    {creatingList ? 'Creating...' : 'Create Shopping List'}
                  </Button>
                </Box>
              ) : (
                <>
                  {/* Add Item to Shopping List */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      fullWidth
                      value={newShoppingItem}
                      onChange={(e) => setNewShoppingItem(e.target.value)}
                      onKeyPress={handleShoppingKeyPress}
                      placeholder="Add item to shopping list..."
                      variant="outlined"
                      disabled={addingShopping}
                      size="small"
                    />
                    <Button
                      onClick={handleAddNewShoppingItem}
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled={!newShoppingItem.trim() || addingShopping}
                      fullWidth={true}
                      sx={{
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {addingShopping ? 'Adding...' : 'Add'}
                    </Button>
                  </Box>

                  {/* Stats */}
                  {shoppingItems.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                      <Chip
                        icon={<ShoppingCartIcon />}
                        label={`${pendingItems.length} pending`}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: '4px',
                          '& .MuiChip-label': {
                            fontWeight: 500
                          }
                        }}
                      />
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`${completedItems.length} completed`}
                        color="success"
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: '4px',
                          '& .MuiChip-label': {
                            fontWeight: 500
                          }
                        }}
                      />
                    </Box>
                  )}

                  {/* Shopping Items */}
                  {shoppingItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2">
                        Your shopping list is empty. Add items from the frequent list below or use the form above!
                      </Typography>
                    </Box>
                  ) : (
                    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <List>
                        {/* Pending Items */}
                        {pendingItems.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <ListItem
                              disablePadding
                              sx={{
                                '& .MuiListItemSecondaryAction-root': {
                                  right: { xs: 8, sm: 16 }
                                }
                              }}
                            >
                              <ListItemButton
                                onClick={() => handleToggleShoppingItem(item.id, item.is_completed)}
                                sx={{
                                  py: 2,
                                  pr: { xs: 7, sm: 9 }
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: { xs: 56, sm: 48 } }}>
                                  <Checkbox
                                    edge="start"
                                    checked={item.is_completed}
                                    disableRipple
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleShoppingItem(item.id, item.is_completed);
                                    }}
                                    sx={{
                                      p: { xs: 1.5, sm: 1 },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1.5rem', sm: '1.25rem' }
                                      }
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.item_name}
                                  primaryTypographyProps={{
                                    variant: 'body1',
                                    sx: {
                                      textDecoration: item.is_completed ? 'line-through' : 'none',
                                      opacity: item.is_completed ? 0.6 : 1,
                                      fontSize: { xs: '1rem', sm: '0.875rem' }
                                    }
                                  }}
                                />
                              </ListItemButton>
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteShoppingItem(item.id);
                                  }}
                                  color="error"
                                  sx={{
                                    p: { xs: 1.5, sm: 1 },
                                    '& .MuiSvgIcon-root': {
                                      fontSize: { xs: '1.5rem', sm: '1.25rem' }
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < pendingItems.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}

                        {/* Divider between pending and completed */}
                        {pendingItems.length > 0 && completedItems.length > 0 && (
                          <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                        )}

                        {/* Completed Items */}
                        {completedItems.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <ListItem
                              disablePadding
                              sx={{
                                '& .MuiListItemSecondaryAction-root': {
                                  right: { xs: 8, sm: 16 }
                                }
                              }}
                            >
                              <ListItemButton
                                onClick={() => handleToggleShoppingItem(item.id, item.is_completed)}
                                sx={{
                                  py: 2,
                                  pr: { xs: 7, sm: 9 }
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: { xs: 56, sm: 48 } }}>
                                  <Checkbox
                                    edge="start"
                                    checked={item.is_completed}
                                    disableRipple
                                    color="success"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleShoppingItem(item.id, item.is_completed);
                                    }}
                                    sx={{
                                      p: { xs: 1.5, sm: 1 },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1.5rem', sm: '1.25rem' }
                                      }
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.item_name}
                                  primaryTypographyProps={{
                                    variant: 'body1',
                                    sx: {
                                      textDecoration: 'line-through',
                                      opacity: 0.6,
                                      color: 'success.main',
                                      fontSize: { xs: '1rem', sm: '0.875rem' }
                                    }
                                  }}
                                />
                              </ListItemButton>
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteShoppingItem(item.id);
                                  }}
                                  color="error"
                                  sx={{
                                    p: { xs: 1.5, sm: 1 },
                                    '& .MuiSvgIcon-root': {
                                      fontSize: { xs: '1.5rem', sm: '1.25rem' }
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < completedItems.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Frequent Items Section - Second on mobile */}
        <Box sx={{ flex: 1, order: { xs: 2, md: 1 } }}>
          <Card>
            <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Frequently Purchased Items
              </Typography>
            </Box>
            <CardContent>
              {/* Add Frequent Item */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  value={newFrequentItem}
                  onChange={(e) => setNewFrequentItem(e.target.value)}
                  onKeyPress={handleFrequentKeyPress}
                  placeholder="Add frequent item..."
                  variant="outlined"
                  disabled={addingFrequent}
                  size="small"
                />
                <Button
                  onClick={handleAddFrequentItem}
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!newFrequentItem.trim() || addingFrequent}
                  fullWidth={true}
                  sx={{
                    whiteSpace: 'nowrap',
                    minWidth: { xs: '100%', sm: 'auto' }
                  }}
                >
                  {addingFrequent ? 'Adding...' : 'Add'}
                </Button>
              </Box>

              {/* Frequent Items List */}
              {frequentItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    No frequent items yet. Add items you buy regularly!
                  </Typography>
                </Box>
              ) : (
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <List>
                    {frequentItems.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => handleAddToShoppingList(item.item_name)}
                            disabled={!shoppingList}
                            sx={{
                              py: 2,
                              '&:hover': {
                                bgcolor: shoppingList ? 'action.hover' : 'transparent'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                              <PlaylistAddIcon
                                color={shoppingList ? 'primary' : 'disabled'}
                                fontSize="medium"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.item_name}
                              primaryTypographyProps={{
                                variant: 'body1',
                                sx: {
                                  fontWeight: 500,
                                  color: 'text.primary',
                                  fontSize: { xs: '1rem', sm: '0.875rem' }
                                }
                              }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFrequentItem(item.id);
                                }}
                                color="error"
                                size="medium"
                                sx={{
                                  opacity: 0.7,
                                  '&:hover': { opacity: 1 }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        </ListItem>
                        {index < frequentItems.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Sharing Section */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600
              }
            }}
          >
            <Tab
              label={`Shared Lists Inbox${sharedLists.length > 0 ? ` (${sharedLists.length})` : ''}`}
              icon={<InboxIcon />}
              iconPosition="start"
            />
            <Tab
              label="Sharing Permissions"
              icon={<SecurityIcon />}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <SharedListInbox
                sharedLists={sharedLists}
                loading={sharingLoading}
                onAcceptList={handleAcceptSharedList}
                onRejectList={handleRejectSharedList}
                onRefresh={loadSharingData}
              />
            )}

            {tabValue === 1 && (
              <SharingPermissions
                permissions={sharingPermissions}
                loading={sharingLoading}
                onAddPermission={handleAddSharingPermission}
                onDeletePermission={handleDeleteSharingPermission}
                onRefresh={loadSharingData}
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Share Dialog */}
      <Dialog
        open={shareDialog.open}
        onClose={() => setShareDialog({ open: false })}
        maxWidth="sm"
        fullWidth
        aria-labelledby="share-dialog-title"
      >
        <DialogTitle id="share-dialog-title">
          Share Shopping List
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the email address of the person you want to share your shopping list with.
            They must have given you permission to share lists with them.
          </Typography>

          <TextField
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="Enter recipient's email address..."
            variant="outlined"
            label="Recipient Email"
            disabled={sharing}
            InputProps={{
              startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
            }}
          />

          {shoppingList && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Sharing "{shoppingList.name || 'Shopping List'}" with {shoppingItems.length} items.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShareDialog({ open: false })}
            color="inherit"
            disabled={sharing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShareList}
            variant="contained"
            disabled={!shareEmail.trim() || sharing}
            startIcon={sharing ? <CircularProgress size={20} color="inherit" /> : <ShareIcon />}
          >
            {sharing ? 'Sharing...' : 'Share List'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ShoppingList;