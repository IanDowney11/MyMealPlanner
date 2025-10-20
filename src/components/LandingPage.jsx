import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  CalendarMonth as CalendarIcon,
  ShoppingCart as ShoppingCartIcon,
  Sync as SyncIcon,
  Security as SecurityIcon,
  Devices as DevicesIcon,
  Share as ShareIcon,
  LocalDining as SnackIcon,
  Api as ApiIcon,
  CloudSync as CloudIcon,
  TrendingUp as TrackingIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import AuthModal from './AuthModal';
import PWAInstallPrompt from './PWAInstallPrompt';

function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const features = [
    {
      icon: <RestaurantIcon sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Meal Management',
      description: 'Add, rate, and organize recipes with images, tags, versions, and external API integration (10,000+ Spoonacular recipes)'
    },
    {
      icon: <CalendarIcon sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Smart Planning',
      description: 'Drag-and-drop weekly calendar with meal tracking, cooking frequency, and event scheduling'
    },
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Shopping & Sharing',
      description: 'Create lists, share between users with permissions, and track completion status'
    },
    {
      icon: <SyncIcon sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Cloud Sync & API',
      description: 'Real-time sync across devices plus REST API for Home Assistant integration'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Secure & Private',
      description: 'Row Level Security, encrypted storage, no data collection - your data stays yours'
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Progressive Web App',
      description: 'Install on any device, works offline, responsive design with Material-UI'
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2980b9 100%)',
      color: 'white',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8, pt: 4 }}>
          <Typography variant="h2" component="h1" sx={{
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            My Meal Planner
          </Typography>

          <Typography variant="h5" sx={{
            mb: 4,
            color: 'grey.300',
            maxWidth: 700,
            mx: 'auto'
          }}>
            The complete meal planning solution with recipe management, smart weekly planning,
            shopping lists, snack discovery, external recipe integration, and Home Assistant API support.
          </Typography>


          <Button
            variant="contained"
            size="large"
            onClick={() => setAuthModalOpen(true)}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #27ae60, #2ecc71)',
              boxShadow: '0 4px 20px rgba(46, 204, 113, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #229954, #27ae60)',
                boxShadow: '0 6px 25px rgba(46, 204, 113, 0.5)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Get Started - Sign Up / Sign In
          </Button>
        </Box>

        {/* Features Grid */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{
            textAlign: 'center',
            mb: 4,
            fontWeight: 'bold',
            color: 'white'
          }}>
            Everything You Need for Meal Planning
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3
          }}>
            {features.map((feature, index) => (
              <Card key={index} sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Additional Features Highlight */}
        <Box sx={{ mb: 8 }}>
          <Paper sx={{
            p: 4,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
              Advanced Features You'll Love
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
              mb: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SnackIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.9)' }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, color: 'white', fontWeight: 'bold' }}>
                    Snack Discovery
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Dedicated snack management with random selection for when you need inspiration
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrackingIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.9)' }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, color: 'white', fontWeight: 'bold' }}>
                    Meal Tracking
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Track cooking frequency and last cooked dates to discover your favorites
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ApiIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.9)' }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, color: 'white', fontWeight: 'bold' }}>
                    External Integration
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Import from 10,000+ Spoonacular recipes or integrate with Home Assistant
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShareIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.9)' }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, color: 'white', fontWeight: 'bold' }}>
                    Smart Sharing
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Permission-based shopping list sharing between family members
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Disclaimer Section */}
        <Paper sx={{
          p: 4,
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          mb: 4
        }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
            Free & Open Source
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: 'grey.300' }}>
            This application is provided as-is for your personal use. We take no responsibility
            for any issues that may arise from its use. Your data is yours - we don't collect
            or sell anything.
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: 'grey.300' }}>
            <strong>No Rights Reserved</strong> - Fork, modify, and contribute as you wish.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => setAuthModalOpen(true)}
              sx={{
                borderColor: 'white',
                color: 'white',
                borderWidth: 2,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#2ecc71',
                  color: '#2ecc71',
                  bgcolor: 'rgba(46, 204, 113, 0.1)',
                  borderWidth: 2,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ready to Start Planning? Sign In Here
            </Button>

            <Button
              variant="outlined"
              href="https://github.com/IanDowney11/MyMealPlanner"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
              sx={{
                borderColor: 'white',
                color: 'white',
                borderWidth: 2,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 2,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              View on GitHub
            </Button>
          </Box>
        </Paper>

      </Container>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <PWAInstallPrompt />
    </Box>
  );
}

export default LandingPage;