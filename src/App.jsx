import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import your page components
import Home from './pages/Home'
import Meals from './pages/Meals'
import MealPlanner from './pages/MealPlanner'
import ShoppingList from './pages/ShoppingList'
import Navigation from './components/Navigation'

function App() {
  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <Navigation />

        <Routes>
          <Route path="/" element={
            <main style={{
              padding: '20px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <Home />
            </main>
          } />
          <Route path="/meals" element={
            <main style={{
              padding: '20px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <Meals />
            </main>
          } />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/shopping-list" element={
            <main style={{
              padding: '20px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <ShoppingList />
            </main>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
