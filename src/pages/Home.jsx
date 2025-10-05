import React, { useState } from 'react';
import MealForm from '../components/MealForm';
import { saveMeal, initDB } from '../services/storage';

function Home() {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showMealForm, setShowMealForm] = useState(false);

  const todaysDinner = {
    name: "Spaghetti Carbonara",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    description: "Classic Italian pasta with eggs, cheese, and pancetta"
  };

  const handleStarClick = (starIndex) => {
    setRating(starIndex);
  };

  const handleStarHover = (starIndex) => {
    setHoveredStar(starIndex);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleSaveMeal = async (mealData) => {
    try {
      await initDB();
      await saveMeal(mealData);
      setShowMealForm(false);
      alert('Meal saved successfully! You can view it in the Meals section.');
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Today's Meal Plan
      </h1>

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#4a90e2',
          color: 'white',
          padding: '15px 20px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🍽️ Tonight's Dinner
        </div>

        <div style={{ padding: '20px' }}>
          <img
            src={todaysDinner.image}
            alt={todaysDinner.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '15px'
            }}
          />

          <h3 style={{
            margin: '0 0 10px 0',
            color: '#333',
            fontSize: '24px'
          }}>
            {todaysDinner.name}
          </h3>

          <p style={{
            color: '#666',
            marginBottom: '20px',
            fontSize: '16px',
            lineHeight: '1.4'
          }}>
            {todaysDinner.description}
          </p>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{
              margin: '0 0 15px 0',
              color: '#333',
              fontSize: '18px'
            }}>
              Rate this meal:
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <span
                    key={starIndex}
                    onClick={() => handleStarClick(starIndex)}
                    onMouseEnter={() => handleStarHover(starIndex)}
                    onMouseLeave={handleStarLeave}
                    style={{
                      fontSize: '28px',
                      cursor: 'pointer',
                      color: (hoveredStar >= starIndex || rating >= starIndex) ? '#ffd700' : '#ddd',
                      transition: 'color 0.2s ease',
                      userSelect: 'none'
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {rating > 0 && (
                <span style={{
                  marginLeft: '10px',
                  color: '#666',
                  fontSize: '16px'
                }}>
                  {rating} out of 5 stars
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Meal Button */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setShowMealForm(true)}
          style={{
            padding: '16px 32px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#218838';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(40, 167, 69, 0.3)';
          }}
        >
          <span style={{ fontSize: '20px' }}>➕</span>
          Quick Add New Meal
        </button>
      </div>

      {/* Meal Form Modal */}
      {showMealForm && (
        <MealForm
          meal={null}
          onSave={handleSaveMeal}
          onCancel={() => setShowMealForm(false)}
        />
      )}
    </div>
  );
}

export default Home;