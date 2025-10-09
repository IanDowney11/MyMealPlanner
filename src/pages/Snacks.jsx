import React, { useState, useEffect } from 'react';
import { Button, IconButton, Typography, Card, CardContent, Box, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
    if (sortField !== field) {
      return <UnfoldMoreIcon sx={{ fontSize: 16, opacity: 0.5 }} />;
    }
    return sortDirection === 'asc' ?
      <ArrowUpIcon sx={{ fontSize: 16 }} /> :
      <ArrowDownIcon sx={{ fontSize: 16 }} />;
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
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h5">Loading snacks...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 3
      }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          My Snacks
        </Typography>
        <Button
          onClick={() => setShowForm(true)}
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Add New Snack
        </Button>
      </Box>

      {snacks.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <TextField
                placeholder="Search snacks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="medium"
                sx={{ width: 350, maxWidth: '100%' }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  )
                }}
              />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    color="inherit"
                  >
                    Clear
                  </Button>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  {searchTerm ? (
                    `${filteredAndSortedSnacks.length} of ${snacks.length} snacks`
                  ) : (
                    `${snacks.length} total snacks`
                  )}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {snacks.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6, border: '2px dashed', borderColor: 'grey.300', bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No snacks saved yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first snack!
            </Typography>
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
            >
              Add Your First Snack
            </Button>
          </CardContent>
        </Card>
      ) : filteredAndSortedSnacks.length === 0 && searchTerm ? (
        <Card sx={{ textAlign: 'center', py: 6, border: '2px solid', borderColor: 'warning.main', bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" color="warning.dark" sx={{ mb: 1 }}>
              No snacks found
            </Typography>
            <Typography variant="body1" color="warning.dark" sx={{ mb: 3 }}>
              No snacks match your search for "{searchTerm}"
            </Typography>
            <Button
              onClick={() => setSearchTerm('')}
              variant="contained"
              color="warning"
              startIcon={<ClearIcon />}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  Image
                </TableCell>
                <TableCell
                  onClick={() => handleSort('title')}
                  sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: sortField === 'title' ? 'primary.light' : 'inherit',
                    '&:hover': {
                      bgcolor: sortField === 'title' ? 'primary.light' : 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Title
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSortIcon('title')}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  Description
                </TableCell>
                <TableCell>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedSnacks.map((snack) => (
                <TableRow key={snack.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>
                    {snack.image ? (
                      <Box
                        component="img"
                        src={snack.image}
                        alt={snack.title}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    ) : (
                      <Box sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🍿
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {snack.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {snack.description ? (
                      <Typography variant="body2" color="text.secondary">
                        {snack.description.length > 100 ?
                          snack.description.substring(0, 100) + '...' :
                          snack.description}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                        No description
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        onClick={() => handleEditSnack(snack)}
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteSnack(snack.id)}
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
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