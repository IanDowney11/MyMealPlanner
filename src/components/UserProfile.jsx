import React, { useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/NostrAuthContext'
import NostrLoginModal from './NostrLoginModal'

function UserProfile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

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
    const displayName = user.displayName || 'User'

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
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {user.npub ? user.npub.slice(0, 16) + '...' : ''}
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
          <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
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

        <NostrLoginModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
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

      <NostrLoginModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}

export default UserProfile
