import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Divider,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  CalendarMonth as CalendarIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  GetApp as InstallIcon
} from '@mui/icons-material';
import UserProfile from './UserProfile';

const drawerWidth = 280;

function Navigation({ open, onToggle }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = window.navigator.standalone === true || isStandalone;
    if (!isInstalled) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowInstallButton(false);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install prompt error:', error);
      }
    } else {
      // Show manual install instructions
      alert('To install this app:\n\n' +
            'Chrome Mobile: Menu (⋮) → "Add to Home screen"\n\n' +
            'Safari iOS: Share button → "Add to Home Screen"\n\n' +
            'Chrome Desktop: Look for install icon in address bar');
    }
  };

  const handleNavItemClick = () => {
    // Close menu on mobile when navigation item is clicked
    if (isMobile && open) {
      onToggle();
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/meals', label: 'Meals', icon: RestaurantIcon },
    { path: '/meal-planner', label: 'Meal Planner', icon: CalendarIcon },
    { path: '/shopping-list', label: 'Shopping List', icon: ShoppingCartIcon },
    { path: '/admin', label: 'Admin', icon: SettingsIcon }
  ];


  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header - Removed title, kept close button for desktop */}
      {!isMobile && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1,
          minHeight: 48
        }}>
          <IconButton
            onClick={onToggle}
            sx={{ color: 'primary.main' }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={active}
                onClick={handleNavItemClick}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    backgroundColor: active ? 'primary.dark' : 'grey.100',
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: active ? 'white' : 'primary.main',
                  minWidth: 48
                }}>
                  <IconComponent sx={{ fontSize: 24 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 'bold' : 'medium',
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section - User Profile and Install */}
      <Box sx={{ mt: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* User Profile */}
        <UserProfile />

        {/* Install App Button */}
        {showInstallButton && (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<InstallIcon />}
            onClick={handleInstallClick}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white'
              }
            }}
          >
            Install App
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={onToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          },
        }}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navigation;
export { drawerWidth };