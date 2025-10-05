import React, { useState, useEffect } from 'react';
import MealForm from '../components/MealForm';
import { getMeals, saveMeal, deleteMeal, initDB } from '../services/storage';

function Meals() {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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

  const handleSaveMeal = async (mealData) => {
    try {
      await saveMeal(mealData);
      await loadMeals();
      setShowForm(false);
      setEditingMeal(null);
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal. Please try again.');
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  const handleDeleteMeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(id);
        await loadMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Error deleting meal. Please try again.');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMeal(null);
  };

  const filteredAndSortedMeals = meals
    .filter(meal => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = meal.title?.toLowerCase().includes(searchLower) || false;
      const descriptionMatch = meal.description?.toLowerCase().includes(searchLower) || false;
      return titleMatch || descriptionMatch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue, bValue;

      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'freezerPortions':
          aValue = a.freezerPortions || 0;
          bValue = b.freezerPortions || 0;
          break;
        default:
          return 0;
      }

      if (sortField === 'title') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
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
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {Array.from({ length: rating }, (_, index) => (
          <span
            key={index}
            style={{
              color: '#ffd700',
              fontSize: '16px'
            }}
          >
            ⭐
          </span>
        ))}
        <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
          ({rating}/5)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading meals...</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>My Meals</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ➕ Add New Meal
        </button>
      </div>

      {/* Search Section */}
      {meals.length > 0 && (
        <div style={{
          marginBottom: '30px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', width: '350px', maxWidth: '100%' }}>
              <input
                type="text"
                placeholder="Search meals by title or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4a90e2';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                }}
              />
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#666'
              }}>
                🔍
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}

              <div style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}>
                {searchTerm ? (
                  `${filteredAndSortedMeals.length} of ${meals.length} meals`
                ) : (
                  `${meals.length} total meals`
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {meals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>No meals saved yet</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            Start by adding your first meal!
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Add Your First Meal
          </button>
        </div>
      ) : filteredAndSortedMeals.length === 0 && searchTerm ? (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          backgroundColor: '#fff3cd',
          borderRadius: '12px',
          border: '2px solid #ffeaa7'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '10px' }}>No meals found</h3>
          <p style={{ color: '#856404', marginBottom: '20px' }}>
            No meals match your search for "{searchTerm}"
          </p>
          <button
            onClick={clearSearch}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Image
                </th>
                <th
                  onClick={() => handleSort('title')}
                  style={{
                    padding: '15px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: sortField === 'title' ? '#e3f2fd' : 'transparent',
                    position: 'relative',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (sortField !== 'title') {
                      e.target.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sortField !== 'title') {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Title
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>
                      {getSortIcon('title')}
                    </span>
                  </div>
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Description
                </th>
                <th
                  onClick={() => handleSort('rating')}
                  style={{
                    padding: '15px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: sortField === 'rating' ? '#e3f2fd' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (sortField !== 'rating') {
                      e.target.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sortField !== 'rating') {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Rating
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>
                      {getSortIcon('rating')}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('freezerPortions')}
                  style={{
                    padding: '15px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: sortField === 'freezerPortions' ? '#e3f2fd' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (sortField !== 'freezerPortions') {
                      e.target.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sortField !== 'freezerPortions') {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Freezer Portions
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>
                      {getSortIcon('freezerPortions')}
                    </span>
                  </div>
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMeals.map((meal) => (
                <tr key={meal.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>
                    {meal.image ? (
                      <img
                        src={meal.image}
                        alt={meal.title}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🍽️
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>
                    {meal.title}
                  </td>
                  <td style={{ padding: '15px', color: '#666', maxWidth: '300px' }}>
                    {meal.description ? (
                      meal.description.length > 100 ?
                        meal.description.substring(0, 100) + '...' :
                        meal.description
                    ) : (
                      <em style={{ color: '#999' }}>No description</em>
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {renderStars(meal.rating)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: meal.freezerPortions > 0 ? '#d4edda' : '#f8d7da',
                      color: meal.freezerPortions > 0 ? '#155724' : '#721c24',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {meal.freezerPortions}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditMeal(meal)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <MealForm
          meal={editingMeal}
          onSave={handleSaveMeal}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}

export default Meals;