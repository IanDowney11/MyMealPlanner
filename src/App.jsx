import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

// Import your page components (create these as placeholders)
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import ShoppingList from './pages/ShoppingList'

function App() {
  return (
    <Router>
      <div style={{ padding: '1rem' }}>
        {/* Navigation Links */}
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
          <Link to="/recipes" style={{ marginRight: '1rem' }}>Recipes</Link>
          <Link to="/shopping-list">Shopping List</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
