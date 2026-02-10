import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import theme from './theme/theme'
import { NostrAuthProvider, useAuth } from './contexts/NostrAuthContext'
import LandingPage from './components/LandingPage'
import ProtectedApp from './components/ProtectedApp'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return user ? <ProtectedApp /> : <LandingPage />
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NostrAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </NostrAuthProvider>
    </ThemeProvider>
  )
}

export default App
