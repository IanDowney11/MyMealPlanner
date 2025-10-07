import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

function UserProfile() {
  const { user, signOut, getUserProfile } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    } else {
      setProfile(null)
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const profileData = await getUserProfile(user.id)
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      handleMenuClose()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleAuthModalOpen = () => {
    setAuthModalOpen(true)
    handleMenuClose()
  }

  if (user) {
    const displayName = profile?.display_name || user.user_metadata?.display_name || 'User'

    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textTransform: 'none',
              color: 'inherit',
              justifyContent: 'flex-start',
              width: '100%',
              px: 2,
              py: 1
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ textAlign: 'left', flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Button>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sign Out</ListItemText>
          </MenuItem>
        </Menu>
      </>
    )
  }

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<LoginIcon />}
        onClick={handleAuthModalOpen}
        sx={{
          borderColor: 'primary.main',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.main',
            color: 'white'
          }
        }}
      >
        Sign In
      </Button>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}

export default UserProfile