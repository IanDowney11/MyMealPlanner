import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState(0) // 0 = login, 1 = register
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })

  const { signIn, signUp } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
    setError('')
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (tab === 0) {
        // Login
        await signIn(formData.email, formData.password)
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        await signUp(formData.email, formData.password, formData.displayName)
      }
      onClose()
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {tab === 1 && (
              <TextField
                name="displayName"
                label="Display Name"
                value={formData.displayName}
                onChange={handleChange}
                required
                fullWidth
                disabled={loading}
              />
            )}

            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
            />

            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
              helperText={tab === 1 ? "Must be at least 6 characters" : ""}
            />

            {tab === 1 && (
              <TextField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                disabled={loading}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Processing...' : (tab === 0 ? 'Sign In' : 'Create Account')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AuthModal