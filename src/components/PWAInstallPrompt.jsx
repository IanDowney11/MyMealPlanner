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
  Box,
  Chip
} from '@mui/material';
import {
  GetApp as InstallIcon,
  PhoneAndroid as MobileIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [installResult, setInstallResult] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [pwaStatus, setPwaStatus] = useState({});

  useEffect(() => {
    // Check PWA status
    checkPWAStatus();

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

  const checkPWAStatus = () => {
    const status = {
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isInstalled: window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches,
      hasServiceWorker: 'serviceWorker' in navigator,
      serviceWorkerRegistered: false,
      manifestLoaded: false,
      isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
    };

    // Check service worker registration
    if (status.hasServiceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        status.serviceWorkerRegistered = registrations.length > 0;
        setPwaStatus(prev => ({ ...prev, serviceWorkerRegistered: status.serviceWorkerRegistered }));
      });
    }

    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    status.manifestLoaded = !!manifestLink;

    setPwaStatus(status);
  };

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

  const getInstallInstructions = () => {
    if (pwaStatus.isChrome && pwaStatus.isMobile) {
      return "Chrome Mobile: Tap the menu (⋮) → 'Add to Home screen'";
    } else if (pwaStatus.userAgent.includes('Safari') && pwaStatus.isMobile) {
      return "Safari iOS: Tap Share button → 'Add to Home Screen'";
    } else if (pwaStatus.isChrome) {
      return "Chrome Desktop: Click the install icon in the address bar or menu";
    }
    return "Look for 'Add to Home Screen' or 'Install App' in your browser menu";
  };

  if (pwaStatus.isInstalled) {
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

      {/* Diagnostic Button - Show only in development or for debugging */}
      {(location.hostname === 'localhost' || new URLSearchParams(location.search).has('debug')) && (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowDiagnostics(true)}
          sx={{
            position: 'fixed',
            bottom: showInstallButton ? 70 : 16,
            right: 16,
            zIndex: 1000
          }}
        >
          PWA Debug
        </Button>
      )}

      {/* Manual Install Instructions */}
      {!showInstallButton && !pwaStatus.isInstalled && (
        <Button
          variant="text"
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
          Install App
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

      {/* Diagnostics Dialog */}
      <Dialog open={showDiagnostics} onClose={() => setShowDiagnostics(false)} maxWidth="sm" fullWidth>
        <DialogTitle>PWA Install Diagnostics</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(pwaStatus).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {typeof value === 'boolean' ? (
                  value ? <CheckIcon color="success" /> : <ErrorIcon color="error" />
                ) : (
                  <Chip label={key} size="small" />
                )}
                <Typography variant="body2">
                  <strong>{key}:</strong> {value?.toString() || 'N/A'}
                </Typography>
              </Box>
            ))}

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Manual Install Instructions:
              </Typography>
              <Typography variant="body2">
                {getInstallInstructions()}
              </Typography>
            </Box>

            {!deferredPrompt && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>No automatic install prompt available.</strong><br/>
                  This can happen if:
                  • You've already dismissed it
                  • The app is already installed
                  • You need more user engagement
                  • Browser doesn't support it
                </Typography>
              </Alert>
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