import React, { useState, useEffect } from 'react';
import {
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box
} from '@mui/material';
import {
  GetApp as InstallIcon,
  PhoneAndroid as MobileIcon
} from '@mui/icons-material';

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [installResult, setInstallResult] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setInstallResult('App installed successfully!');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setInstallResult('Install prompt not available. Try the browser menu.');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setInstallResult('User accepted the install prompt');
      } else {
        setInstallResult('User dismissed the install prompt');
      }
    } catch (error) {
      setInstallResult('Error during install: ' + error.message);
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInstalled = window.navigator.standalone === true || isStandalone;

  if (isInstalled) {
    return null; // Already installed
  }

  return (
    <>
      {/* Install Button */}
      {showInstallButton && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<InstallIcon />}
          onClick={handleInstallClick}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          Install App
        </Button>
      )}

      {/* Manual Install Button */}
      {!showInstallButton && !isInstalled && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<MobileIcon />}
          onClick={() => setShowDiagnostics(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            fontSize: '0.75rem'
          }}
        >
          Install
        </Button>
      )}

      {/* Install Result Snackbar */}
      <Snackbar
        open={!!installResult}
        autoHideDuration={6000}
        onClose={() => setInstallResult('')}
      >
        <Alert
          onClose={() => setInstallResult('')}
          severity={installResult.includes('Error') ? 'error' : 'success'}
        >
          {installResult}
        </Alert>
      </Snackbar>

      {/* Manual Install Instructions Dialog */}
      <Dialog open={showDiagnostics} onClose={() => setShowDiagnostics(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Install App</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              To install this app on your device:
            </Typography>

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Chrome Mobile:</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                Tap the menu (⋮) → "Add to Home screen"
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                <strong>Safari iOS:</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                Tap the Share button → "Add to Home Screen"
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                <strong>Chrome Desktop:</strong>
              </Typography>
              <Typography variant="body2">
                Look for the install icon in the address bar or browser menu
              </Typography>
            </Box>

            {!deferredPrompt && (
              <Typography variant="body2" color="text.secondary">
                Note: The automatic install prompt may not appear if you've already dismissed it or the app is already installed.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDiagnostics(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PWAInstallPrompt;