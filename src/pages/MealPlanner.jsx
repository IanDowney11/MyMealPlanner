import React, { useState, useEffect } from 'react';
import { getMeals, initDB, saveMealPlan, deleteMealPlan, getWeekMealPlans } from '../services/storage';

function MealPlanner() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [draggedMeal, setDraggedMeal] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(null);

  // Calculate current week dates
  const getWeekDates = () => {
    const today = new Date();
    const monday = getMonday(today);
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = formatDate(date);
    const todayStr = formatDate(today);
    const tomorrowStr = formatDate(tomorrow);

    if (dateStr === todayStr) {
      return `Today (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    } else if (dateStr === tomorrowStr) {
      return `Tomorrow (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const weekDates = getWeekDates();

  useEffect(() => {
    loadMeals();
    loadWeekPlan();
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (weekDates.length > 0) {
      const mondayStr = formatDate(weekDates[0]);
      setCurrentWeekStart(mondayStr);
      loadWeekPlan();
    }
  }, []);

  const checkScreenSize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (mobile) {
      setSidebarOpen(false);
    }
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

  const loadWeekPlan = async () => {
    try {
      if (weekDates.length > 0) {
        const mondayStr = formatDate(weekDates[0]);
        const weekPlans = await getWeekMealPlans(mondayStr);

        const planMap = {};
        weekPlans.forEach(plan => {
          planMap[plan.date] = plan.meal;
        });

        setWeeklyPlan(planMap);
      }
    } catch (error) {
      console.error('Error loading week plan:', error);
    }
  };

  const handleDragStart = (e, meal) => {
    setDraggedMeal(meal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    if (draggedMeal) {
      try {
        const dateStr = formatDate(date);
        await saveMealPlan(dateStr, draggedMeal);

        setWeeklyPlan(prev => ({
          ...prev,
          [dateStr]: draggedMeal
        }));
        setDraggedMeal(null);
      } catch (error) {
        console.error('Error saving meal plan:', error);
        alert('Error saving meal plan. Please try again.');
      }
    }
  };

  const removeMealFromDay = async (date) => {
    try {
      const dateStr = formatDate(date);
      await deleteMealPlan(dateStr);

      setWeeklyPlan(prev => {
        const newPlan = { ...prev };
        delete newPlan[dateStr];
        return newPlan;
      });
    } catch (error) {
      console.error('Error removing meal plan:', error);
      alert('Error removing meal plan. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderMealCard = (meal, isInSidebar = true) => (
    <div
      key={meal.id}
      draggable={isInSidebar}
      onDragStart={(e) => isInSidebar && handleDragStart(e, meal)}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: isInSidebar ? 'grab' : 'default',
        border: '2px solid transparent',
        transition: 'all 0.3s ease',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (isInSidebar) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (isInSidebar) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {meal.image ? (
          <img
            src={meal.image}
            alt={meal.title}
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        ) : (
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🍽️
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {meal.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {Array.from({ length: meal.rating || 0 }, (_, index) => (
                <span key={index} style={{ color: '#ffd700', fontSize: '14px' }}>⭐</span>
              ))}
            </div>
            {meal.freezerPortions > 0 && (
              <span style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {meal.freezerPortions} frozen
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendarDay = (date) => {
    const dateStr = formatDate(date);
    const plannedMeal = weeklyPlan[dateStr];

    return (
      <div
        key={dateStr}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          minHeight: '200px',
          border: '2px dashed #dee2e6',
          transition: 'all 0.3s ease'
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, date)}
        onDragEnter={(e) => {
          e.target.style.borderColor = '#4a90e2';
          e.target.style.backgroundColor = '#f8f9ff';
        }}
        onDragLeave={(e) => {
          e.target.style.borderColor = '#dee2e6';
          e.target.style.backgroundColor = 'white';
        }}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '8px',
          lineHeight: '1.3'
        }}>
          {formatDisplayDate(date)}
        </h3>

        <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '14px', color: '#666' }}>
          🍽️ Dinner
        </div>

        {plannedMeal ? (
          <div style={{ position: 'relative' }}>
            {renderMealCard(plannedMeal, false)}
            <button
              onClick={() => removeMealFromDay(date)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
            fontStyle: 'italic',
            padding: '40px 20px'
          }}>
            Drag a meal here
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading meal planner...</h2>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 64px)', // Subtract navigation height
      backgroundColor: '#f8f9fa',
      position: 'relative'
    }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '320px' : '0',
        backgroundColor: 'white',
        borderRight: '1px solid #dee2e6',
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        zIndex: isMobile ? 1000 : 1,
        position: isMobile ? 'fixed' : 'relative',
        height: '100%',
        boxShadow: isMobile ? '2px 0 8px rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
              Available Meals
            </h2>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {meals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <p>No meals available.</p>
              <p style={{ fontSize: '14px' }}>Add some meals first!</p>
            </div>
          ) : (
            <div>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                fontStyle: 'italic'
              }}>
                Drag meals to plan your week
              </p>
              {meals.map(meal => renderMealCard(meal, true))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#666'
              }}
            >
              ☰
            </button>
            <h1 style={{ margin: 0, color: '#333' }}>Weekly Meal Planner</h1>
          </div>

          <div style={{
            fontSize: '14px',
            color: '#666',
            textAlign: 'right'
          }}>
            <div>📅 This Week's Plan</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {Object.keys(weeklyPlan).length} of 7 days planned
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {weekDates.map(date => renderCalendarDay(date))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealPlanner;