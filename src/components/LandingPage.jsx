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
  Devices as DevicesIcon
} from '@mui/icons-material';
import AuthModal from './AuthModal';

function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const features = [
    {
      icon: <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Meal Management',
      description: 'Add, rate, and organize your favorite recipes with ease'
    },
    {
      icon: <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Weekly Planning',
      description: 'Drag and drop meals to plan your entire week in minutes'
    },
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Shopping Lists',
      description: 'Generate shopping lists based on your meal plans'
    },
    {
      icon: <SyncIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Cloud Sync',
      description: 'Your data syncs across all your devices automatically'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Private',
      description: 'Your meal data is encrypted and only accessible to you'
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Works Everywhere',
      description: 'Use on desktop, tablet, or mobile - install as a PWA'
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1d29 0%, #2d3142 100%)',
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
            maxWidth: 600,
            mx: 'auto'
          }}>
            The ultimate tool for planning your weekly meals, managing recipes, and staying organized in the kitchen.
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
            <Chip label="🍽️ Meal Planning" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
            <Chip label="📱 PWA Ready" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
            <Chip label="☁️ Cloud Sync" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
            <Chip label="🔒 Secure" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
          </Stack>

          <Button
            variant="contained"
            size="large"
            onClick={() => setAuthModalOpen(true)}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976d2, #0288d1)',
                boxShadow: '0 6px 25px rgba(33, 150, 243, 0.4)'
              }
            }}
          >
            Get Started - Sign Up Free
          </Button>
        </Box>

        {/* Features Grid */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 'bold',
            color: 'white'
          }}>
            Everything You Need
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
            There are no rights reserved - feel free to fork, modify, or contribute.
            <strong> Forking is a compliment!</strong>
          </Typography>

          <Button
            variant="outlined"
            onClick={() => setAuthModalOpen(true)}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                bgcolor: 'rgba(33, 150, 243, 0.1)'
              }
            }}
          >
            Ready to Start Planning? Sign In Here
          </Button>
        </Paper>

        {/* Footer */}
        <Typography variant="body2" sx={{
          textAlign: 'center',
          color: 'grey.400',
          mt: 4
        }}>
          Built with ❤️ for meal planning enthusiasts everywhere
        </Typography>
      </Container>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </Box>
  );
}

export default LandingPage;