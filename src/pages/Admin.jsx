import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, CardContent, Box, Grid, CircularProgress, Alert, Input, Autocomplete, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper } from '@mui/material';
import { FileDownload as ExportIcon, FileUpload as ImportIcon, Public as TimezoneIcon, Sync as SyncIcon, Delete as DeleteIcon, Add as AddIcon, Key as KeyIcon } from '@mui/icons-material';
import { getMeals, saveMeal, initDB } from '../services/mealsService';
import { getFrequentItems, addFrequentItem } from '../services/shoppingListService';
import { getUserTimezone, setUserTimezone, getAvailableTimezones } from '../services/timezoneService';
import { getRelays, addRelay, removeRelay } from '../lib/nostr';
import { processSyncQueue } from '../services/syncService';
import { useAuth } from '../contexts/NostrAuthContext';

function Admin() {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [timezone, setTimezone] = useState('');
  const [availableTimezones, setAvailableTimezones] = useState([]);
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [relays, setRelaysState] = useState([]);
  const [newRelay, setNewRelay] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [frequentItems, setFrequentItems] = useState([]);
  const [exportingFreqItems, setExportingFreqItems] = useState(false);
  const [importingFreqItems, setImportingFreqItems] = useState(false);

  useEffect(() => {
    loadMeals();
    loadFrequentItems();
    loadTimezone();
    setRelaysState(getRelays());
  }, []);

  const loadTimezone = async () => {
    try {
      const tz = await getUserTimezone();
      setTimezone(tz);
      const tzList = getAvailableTimezones();
      setAvailableTimezones(tzList);
    } catch (error) {
      console.error('Error loading timezone:', error);
    }
  };

  const handleTimezoneChange = async (newTimezone) => {
    try {
      setSavingTimezone(true);
      await setUserTimezone(newTimezone);
      setTimezone(newTimezone);
      alert('Timezone saved successfully! Please reload the page for changes to take effect.');
    } catch (error) {
      console.error('Error saving timezone:', error);
      alert('Error saving timezone. Please try again.');
    } finally {
      setSavingTimezone(false);
    }
  };

  const loadFrequentItems = async () => {
    try {
      const items = await getFrequentItems();
      setFrequentItems(items);
    } catch (error) {
      console.error('Error loading frequent items:', error);
    }
  };

  const exportFrequentItems = async () => {
    try {
      setExportingFreqItems(true);

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalItems: frequentItems.length,
        frequentItems: frequentItems.map(item => ({
          itemName: item.itemName || item.item_name
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meal-planner-frequent-items-${new Date().toISOString().split('T')[0]}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      alert(`Successfully exported ${frequentItems.length} frequent items to JSON file!`);
    } catch (error) {
      console.error('Error exporting frequent items:', error);
      alert('Error exporting frequent items. Please try again.');
    } finally {
      setExportingFreqItems(false);
    }
  };

  const handleFreqItemsFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Please select a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImportingFreqItems(true);
        const jsonData = JSON.parse(e.target.result);

        if (!jsonData.frequentItems || !Array.isArray(jsonData.frequentItems)) {
          throw new Error('Invalid JSON format. Expected frequentItems array.');
        }

        let importedCount = 0;
        let errorCount = 0;

        for (const item of jsonData.frequentItems) {
          try {
            const name = item.itemName || item.item_name;
            if (!name) {
              console.warn('Skipping item without name:', item);
              errorCount++;
              continue;
            }

            await addFrequentItem(name);
            importedCount++;
          } catch (itemError) {
            // Duplicate items will throw due to unique index - skip silently
            if (itemError.name === 'ConstraintError') {
              continue;
            }
            console.error('Error importing frequent item:', item, itemError);
            errorCount++;
          }
        }

        await loadFrequentItems();

        if (errorCount > 0) {
          alert(`Import completed with some issues:\n- Successfully imported: ${importedCount} items\n- Failed to import: ${errorCount} items\n\nCheck console for details.`);
        } else {
          alert(`Successfully imported ${importedCount} frequent items!`);
        }

        event.target.value = '';
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Error importing frequent items. Please check that your JSON file is valid.');
      } finally {
        setImportingFreqItems(false);
      }
    };

    reader.readAsText(file);
  };

  const loadMeals = async () => {
    try {
      await initDB();
      const mealsList = await getMeals();
      setMeals(mealsList);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMeals = async () => {
    try {
      setExporting(true);

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalMeals: meals.length,
        meals: meals
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meal-planner-meals-${new Date().toISOString().split('T')[0]}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      alert(`Successfully exported ${meals.length} meals to JSON file!`);
    } catch (error) {
      console.error('Error exporting meals:', error);
      alert('Error exporting meals. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Please select a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImporting(true);
        const jsonData = JSON.parse(e.target.result);

        if (!jsonData.meals || !Array.isArray(jsonData.meals)) {
          throw new Error('Invalid JSON format. Expected meals array.');
        }

        let importedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Build a set of existing meal titles for duplicate detection
        const existingTitles = new Set(meals.map(m => m.title.toLowerCase()));

        for (const meal of jsonData.meals) {
          try {
            if (!meal.title) {
              console.warn('Skipping meal without title:', meal);
              errorCount++;
              continue;
            }

            if (existingTitles.has(meal.title.toLowerCase())) {
              skippedCount++;
              continue;
            }

            const mealToImport = {
              ...meal,
              id: undefined,
              importedAt: new Date().toISOString()
            };

            await saveMeal(mealToImport);
            existingTitles.add(meal.title.toLowerCase());
            importedCount++;
          } catch (mealError) {
            console.error('Error importing meal:', meal, mealError);
            errorCount++;
          }
        }

        await loadMeals();

        const parts = [];
        if (importedCount > 0) parts.push(`Imported: ${importedCount} meals`);
        if (skippedCount > 0) parts.push(`Skipped (already exist): ${skippedCount} meals`);
        if (errorCount > 0) parts.push(`Failed: ${errorCount} meals`);
        alert(parts.join('\n'));

        event.target.value = '';
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Error importing meals. Please check that your JSON file is valid.');
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const handleAddRelay = () => {
    if (!newRelay.trim()) return;
    let url = newRelay.trim();
    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      url = 'wss://' + url;
    }
    const updated = addRelay(url);
    setRelaysState(updated);
    setNewRelay('');
  };

  const handleRemoveRelay = (url) => {
    const updated = removeRelay(url);
    setRelaysState(updated);
  };

  const handleForceSync = async () => {
    try {
      setSyncing(true);
      await processSyncQueue();
      alert('Sync completed!');
    } catch (error) {
      console.error('Error during sync:', error);
      alert('Sync failed. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h5">Loading admin panel...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your data, relays, and settings
        </Typography>
      </Box>

      {/* NOSTR Identity */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            NOSTR Identity
          </Typography>

          <Alert severity="info" icon={<KeyIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              <strong>npub:</strong> {user?.npub || 'Not logged in'}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2.5, fontWeight: 'bold' }}>
            Database Statistics
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: 'grey.50', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {meals.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Total Meals
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: 'grey.50', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {meals.filter(m => m.rating >= 4).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  High Rated (4+ stars)
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: 'grey.50', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {meals.filter(m => m.freezerPortions > 0).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  With Fridge/Freezer Portions
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Relay Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            NOSTR Relays
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Manage the NOSTR relays used for syncing your data across devices. Your data is encrypted before being sent to relays.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              value={newRelay}
              onChange={(e) => setNewRelay(e.target.value)}
              placeholder="wss://relay.example.com"
              size="small"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRelay()}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRelay}
              disabled={!newRelay.trim()}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Add
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ mb: 2 }}>
            <List dense>
              {relays.map((relay, index) => (
                <ListItem key={relay} divider={index < relays.length - 1}>
                  <ListItemText
                    primary={relay}
                    primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveRelay(relay)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>

          <Button
            variant="contained"
            color="primary"
            startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            onClick={handleForceSync}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Force Sync'}
          </Button>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Timezone Settings
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Set your timezone to ensure all dates and times are displayed correctly.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Autocomplete
              value={timezone}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleTimezoneChange(newValue);
                }
              }}
              options={availableTimezones}
              disabled={savingTimezone}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Timezone"
                  placeholder="Search for your timezone..."
                  variant="outlined"
                />
              )}
              sx={{ maxWidth: 500 }}
            />
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Current timezone:</strong> {timezone || 'Loading...'}
            <br />
            <Typography variant="caption">
              Current local time: {new Date().toLocaleString('en-US', { timeZone: timezone || undefined })}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Export Meals
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Export all your meals to a JSON file for backup or sharing.
          </Typography>

          <Button
            onClick={exportMeals}
            disabled={exporting || meals.length === 0}
            variant="contained"
            color="success"
            startIcon={exporting ? null : <ExportIcon />}
            size="large"
            sx={{ fontWeight: 'bold' }}
          >
            {exporting ? 'Exporting...' : `Export ${meals.length} Meals to JSON`}
          </Button>

          {meals.length === 0 && (
            <Typography variant="body2" color="error" sx={{ mt: 1, fontStyle: 'italic' }}>
              No meals available to export. Add some meals first!
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Import Meals Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Import Meals
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Import meals from a JSON file. Existing meals will not be affected - only new meals will be added.
          </Typography>

          <Box sx={{
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            mb: 2,
            backgroundColor: 'grey.50'
          }}>
            <Input
              type="file"
              inputProps={{ accept: '.json' }}
              onChange={handleFileImport}
              disabled={importing}
              sx={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImportIcon />}
                disabled={importing}
                sx={{ mb: 1.5 }}
              >
                Choose JSON File
              </Button>
            </label>

            <Typography variant="body2" color="text.secondary">
              {importing ? (
                <Box sx={{ color: 'primary.main' }}>
                  Importing meals...
                </Box>
              ) : (
                <>
                  Select a JSON file exported from Meal Planner
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Supported format: JSON files with meals array
                  </Typography>
                </>
              )}
            </Typography>
          </Box>

          <Alert severity="warning">
            <strong>Important:</strong> Importing will add new meals to your collection.
            Meals with the same title may be duplicated. Make sure to backup your data before importing.
          </Alert>
        </CardContent>
      </Card>

      {/* Export Frequent Items */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Export Frequent Items
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Export your frequently purchased items to a JSON file for backup or sharing.
          </Typography>

          <Button
            onClick={exportFrequentItems}
            disabled={exportingFreqItems || frequentItems.length === 0}
            variant="contained"
            color="success"
            startIcon={exportingFreqItems ? null : <ExportIcon />}
            size="large"
            sx={{ fontWeight: 'bold' }}
          >
            {exportingFreqItems ? 'Exporting...' : `Export ${frequentItems.length} Frequent Items to JSON`}
          </Button>

          {frequentItems.length === 0 && (
            <Typography variant="body2" color="error" sx={{ mt: 1, fontStyle: 'italic' }}>
              No frequent items available to export. Add some items first!
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Import Frequent Items */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Import Frequent Items
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Import frequently purchased items from a JSON file. Duplicate items will be skipped.
          </Typography>

          <Box sx={{
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            mb: 2,
            backgroundColor: 'grey.50'
          }}>
            <Input
              type="file"
              inputProps={{ accept: '.json' }}
              onChange={handleFreqItemsFileImport}
              disabled={importingFreqItems}
              sx={{ display: 'none' }}
              id="freq-items-file-input"
            />
            <label htmlFor="freq-items-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImportIcon />}
                disabled={importingFreqItems}
                sx={{ mb: 1.5 }}
              >
                Choose JSON File
              </Button>
            </label>

            <Typography variant="body2" color="text.secondary">
              {importingFreqItems ? (
                <Box sx={{ color: 'primary.main' }}>
                  Importing frequent items...
                </Box>
              ) : (
                <>
                  Select a JSON file exported from Meal Planner
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Supported format: JSON files with frequentItems array
                  </Typography>
                </>
              )}
            </Typography>
          </Box>

          <Alert severity="info">
            Items that already exist in your list will be skipped automatically.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Admin;
