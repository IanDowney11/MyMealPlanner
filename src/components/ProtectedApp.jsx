import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box, useMediaQuery, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import theme from '../theme/theme';

// Import your page components
import Home from '../pages/Home';
import Meals from '../pages/Meals';
import MealPlanner from '../pages/MealPlanner';
import ShoppingList from '../pages/ShoppingList';
import Admin from '../pages/Admin';
import Navigation, { drawerWidth } from './Navigation';

function ProtectedApp() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Start closed on mobile, open on desktop

  // Auto-close sidebar on mobile, auto-open on desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation open={sidebarOpen} onToggle={handleSidebarToggle} />

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            marginLeft: isMobile ? 0 : (sidebarOpen ? 0 : `-${drawerWidth}px`),
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            width: isMobile ? '100%' : (sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%'),
          }}
        >
          {/* Menu button when sidebar is closed */}
          {!sidebarOpen && (
            <Box
              sx={{
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: theme.zIndex.drawer - 1,
              }}
            >
              <IconButton
                onClick={handleSidebarToggle}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  boxShadow: 2,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          <Routes>
            <Route path="/" element={
              <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Home />
              </Box>
            } />
            <Route path="/meals" element={
              <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Meals />
              </Box>
            } />
            <Route path="/meal-planner" element={<MealPlanner />} />
            <Route path="/shopping-list" element={
              <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <ShoppingList />
              </Box>
            } />
            <Route path="/admin" element={
              <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Admin />
              </Box>
            } />
          </Routes>
        </Box>
      </Box>
      {/* <PWAInstallPrompt /> */}
    </>
  );
}

export default ProtectedApp;