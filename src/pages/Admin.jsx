import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, CardContent, Box, Grid, CircularProgress, Alert, Input } from '@mui/material';
import { FileDownload as ExportIcon, FileUpload as ImportIcon, BugReport as DebugIcon } from '@mui/icons-material';
import { getMeals, saveMeal, initDB } from '../services/mealsService';
import { testSupabaseConnection } from '../utils/debugSupabase';
import { debugSharingSetup } from '../services/sharingService';

function Admin() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [debugEmail, setDebugEmail] = useState('');

  useEffect(() => {
    loadMeals();
  }, []);

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

        // Validate the JSON structure
        if (!jsonData.meals || !Array.isArray(jsonData.meals)) {
          throw new Error('Invalid JSON format. Expected meals array.');
        }

        let importedCount = 0;
        let errorCount = 0;

        for (const meal of jsonData.meals) {
          try {
            // Validate required fields
            if (!meal.title) {
              console.warn('Skipping meal without title:', meal);
              errorCount++;
              continue;
            }

            // Generate new ID to avoid conflicts
            const mealToImport = {
              ...meal,
              id: undefined, // Let saveMeal generate a new ID
              importedAt: new Date().toISOString()
            };

            await saveMeal(mealToImport);
            importedCount++;
          } catch (mealError) {
            console.error('Error importing meal:', meal, mealError);
            errorCount++;
          }
        }

        // Reload meals to show imported data
        await loadMeals();

        if (errorCount > 0) {
          alert(`Import completed with some issues:\n- Successfully imported: ${importedCount} meals\n- Failed to import: ${errorCount} meals\n\nCheck console for details.`);
        } else {
          alert(`Successfully imported ${importedCount} meals!`);
        }

        // Clear the file input
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
          🔧 Admin Panel
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your meal data with export and import functionality
        </Typography>
      </Box>

      {/* Statistics Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2.5, fontWeight: 'bold' }}>
            📊 Database Statistics
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

      {/* Export Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            📤 Export Meals
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Export all your meals to a JSON file for backup or sharing. The exported file will include all meal data including titles, descriptions, ratings, images, and fridge/freezer portions.
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
            {exporting ? (
              <>
                ⏳ Exporting...
              </>
            ) : (
              <>
                Export {meals.length} Meals to JSON
              </>
            )}
          </Button>

          {meals.length === 0 && (
            <Typography variant="body2" color="error" sx={{ mt: 1, fontStyle: 'italic' }}>
              No meals available to export. Add some meals first!
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            📥 Import Meals
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Import meals from a JSON file. The file should contain an array of meal objects with the proper structure. Existing meals will not be affected - only new meals will be added.
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
                  ⏳ Importing meals...
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
            <strong>⚠️ Important:</strong> Importing will add new meals to your collection.
            Meals with the same title may be duplicated. Make sure to backup your data before importing.
          </Alert>
        </CardContent>
      </Card>

      {/* Debug Section */}
      <Card sx={{ mb: 4, backgroundColor: 'error.lighter' }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'error.dark' }}>
            🐛 Debug Tools
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Debugging tools to diagnose connection and sharing issues.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              onClick={testSupabaseConnection}
              variant="contained"
              color="error"
              startIcon={<DebugIcon />}
              size="large"
            >
              Test Supabase Connection
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'error.dark' }}>
            Debug Sharing Setup
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter an email address to debug sharing permissions and setup.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Input
              value={debugEmail}
              onChange={(e) => setDebugEmail(e.target.value)}
              placeholder="Enter email to debug..."
              sx={{ flex: 1 }}
            />
            <Button
              onClick={() => debugSharingSetup(debugEmail)}
              variant="outlined"
              color="error"
              startIcon={<DebugIcon />}
              disabled={!debugEmail.trim()}
            >
              Debug Sharing
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Admin;