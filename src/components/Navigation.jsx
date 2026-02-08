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
  LocalDining as SnackIcon,
  CalendarMonth as CalendarIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import UserProfile from './UserProfile';
import packageJson from '../../package.json';

const APP_VERSION = packageJson.version;
const drawerWidth = 280;

function Navigation({ open, onToggle }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavItemClick = () => {
    // Close menu on mobile when navigation item is clicked
    if (isMobile && open) {
      onToggle();
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/meals', label: 'Meals', icon: RestaurantIcon },
    { path: '/snacks', label: 'Snacks', icon: SnackIcon },
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

      {/* Version Number */}
      <Typography
        variant="caption"
        sx={{ px: 3, py: 0.5, color: 'text.disabled' }}
      >
        v{APP_VERSION}
      </Typography>

      {/* Bottom Section - User Profile */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        {/* User Profile */}
        <UserProfile />
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