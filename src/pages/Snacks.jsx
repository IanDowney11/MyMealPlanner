import React, { useState, useEffect } from 'react';
import { Button, IconButton, Typography, Card, CardContent, Box, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar } from '@mui/material';
import { Add as AddIcon, Clear as ClearIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, UnfoldMore as UnfoldMoreIcon, KeyboardArrowUp as ArrowUpIcon, KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import SnackForm from '../components/SnackForm';
import { getSnacks, saveSnack, deleteSnack, initDB } from '../services/snacksService';

function Snacks() {
  const [snacks, setSnacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSnack, setEditingSnack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    loadSnacks();
  }, []);

  const loadSnacks = async () => {
    try {
      await initDB();
      const snacksList = await getSnacks();
      setSnacks(snacksList);
    } catch (error) {
      console.error('Error loading snacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSnack = async (snackData) => {
    try {
      await saveSnack(snackData);
      await loadSnacks();
      setShowForm(false);
      setEditingSnack(null);
    } catch (error) {
      console.error('Error saving snack:', error);
      alert('Error saving snack. Please try again.');
    }
  };

  const handleEditSnack = (snack) => {
    setEditingSnack(snack);
    setShowForm(true);
  };

  const handleDeleteSnack = async (id) => {
    if (window.confirm('Are you sure you want to delete this snack?')) {
      try {
        await deleteSnack(id);
        await loadSnacks();
      } catch (error) {
        console.error('Error deleting snack:', error);
        alert('Error deleting snack. Please try again.');
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <UnfoldMoreIcon />;
    return sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />;
  };

  const filteredAndSortedSnacks = snacks
    .filter(snack =>
      snack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (snack.description && snack.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // Convert to strings for comparison
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();

      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 2 }}>
        <CircularProgress color="primary" size={40} />
        <Typography variant="h6" color="text.secondary">
          Loading snacks...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          My Snacks
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          sx={{ borderRadius: 2 }}
        >
          Add Snack
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search snacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            endAdornment: searchTerm && (
              <IconButton onClick={() => setSearchTerm('')} size="small">
                <ClearIcon />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Snacks Table */}
      {filteredAndSortedSnacks.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No snacks found matching your search' : 'No snacks yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Start building your snack collection!'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
              >
                Add Your First Snack
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell width={80}>Image</TableCell>
                <TableCell
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('title')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Title
                    </Typography>
                    {getSortIcon('title')}
                  </Box>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell width={120} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedSnacks.map((snack) => (
                <TableRow key={snack.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>
                    {snack.image ? (
                      <Avatar
                        src={snack.image}
                        alt={snack.title}
                        sx={{ width: 50, height: 50, borderRadius: 1 }}
                        variant="rounded"
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: 'primary.light',
                          borderRadius: 1,
                          fontSize: '20px'
                        }}
                        variant="rounded"
                      >
                        🍿
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {snack.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {snack.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleEditSnack(snack)}
                        color="primary"
                        size="small"
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteSnack(snack.id)}
                        color="error"
                        size="small"
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snack Form Modal */}
      {showForm && (
        <SnackForm
          snack={editingSnack}
          onSave={handleSaveSnack}
          onCancel={() => {
            setShowForm(false);
            setEditingSnack(null);
          }}
        />
      )}
    </Box>
  );
}

export default Snacks;