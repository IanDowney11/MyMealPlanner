import React, { useState, useEffect } from 'react';

function MealForm({ meal = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: 1,
    freezerPortions: 0,
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (meal) {
      setFormData({
        title: meal.title || '',
        description: meal.description || '',
        rating: meal.rating || 1,
        freezerPortions: meal.freezerPortions || 0,
        image: meal.image || ''
      });
      setImagePreview(meal.image || '');
    }
  }, [meal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'freezerPortions' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setFormData(prev => ({ ...prev, image: imageData }));
        setImagePreview(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a meal title');
      return;
    }

    const mealData = {
      ...formData,
      id: meal?.id
    };

    onSave(mealData);
  };

  const renderStars = () => {
    return (
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} style={{ cursor: 'pointer', fontSize: '20px' }}>
            <input
              type="radio"
              name="rating"
              value={star}
              checked={formData.rating === star}
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <span style={{ color: star <= formData.rating ? '#ffd700' : '#ddd' }}>
              ⭐
            </span>
          </label>
        ))}
        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
          {formData.rating} out of 5
        </span>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
          {meal ? 'Edit Meal' : 'Add New Meal'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Rating
            </label>
            {renderStars()}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Portions in Freezer
            </label>
            <input
              type="number"
              name="freezerPortions"
              value={formData.freezerPortions}
              onChange={handleChange}
              min="0"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#4a90e2',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {meal ? 'Update Meal' : 'Save Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MealForm;