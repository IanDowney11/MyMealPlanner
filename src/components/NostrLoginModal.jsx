import React, { useState } from 'react';
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
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import {
  Extension as ExtensionIcon,
  Key as KeyIcon,
  AddCircle as GenerateIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/NostrAuthContext';

function NostrLoginModal({ open, onClose }) {
  const [mode, setMode] = useState(null); // null | 'nsec' | 'generated'
  const [nsecInput, setNsecInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedKeys, setGeneratedKeys] = useState(null);
  const [copied, setCopied] = useState(false);

  const { loginWithExtension, loginWithNsec, generateNewKeys, confirmGeneratedKeys } = useAuth();

  const handleExtensionLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithExtension();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNsecLogin = async () => {
    if (!nsecInput.trim()) return;
    setError('');
    setLoading(true);
    try {
      await loginWithNsec(nsecInput.trim());
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKeys = async () => {
    setError('');
    setLoading(true);
    try {
      const keys = await generateNewKeys();
      setGeneratedKeys(keys);
      setMode('generated');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNsec = async () => {
    if (generatedKeys?.nsec) {
      await navigator.clipboard.writeText(generatedKeys.nsec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmGenerated = () => {
    if (generatedKeys) {
      confirmGeneratedKeys(generatedKeys);
    }
    onClose();
  };

  const handleClose = () => {
    setMode(null);
    setNsecInput('');
    setError('');
    setGeneratedKeys(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Sign In with NOSTR
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {mode === 'generated' && generatedKeys ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>
              Save your secret key (nsec) somewhere safe. If you lose it, you cannot recover your account.
            </Alert>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Your Public Key (npub)
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {generatedKeys.npub}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Your Secret Key (nsec) - KEEP THIS SAFE
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', mb: 1 }}>
                {generatedKeys.nsec}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyNsec}
              >
                {copied ? 'Copied!' : 'Copy nsec'}
              </Button>
            </Paper>
          </Box>
        ) : mode === 'nsec' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Paste your NOSTR secret key (nsec) to sign in.
            </Typography>
            <TextField
              fullWidth
              value={nsecInput}
              onChange={(e) => setNsecInput(e.target.value)}
              placeholder="nsec1..."
              variant="outlined"
              type="password"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleNsecLogin()}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <ExtensionIcon />}
              onClick={handleExtensionLogin}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Sign in with Browser Extension (NIP-07)
            </Button>

            <Divider>or</Divider>

            <Button
              variant="outlined"
              size="large"
              startIcon={<KeyIcon />}
              onClick={() => setMode('nsec')}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Paste nsec Key
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<GenerateIcon />}
              onClick={handleGenerateKeys}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Generate New Keys
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {mode === 'generated' ? (
          <Button
            variant="contained"
            onClick={handleConfirmGenerated}
          >
            I've Saved My Key - Continue
          </Button>
        ) : mode === 'nsec' ? (
          <>
            <Button onClick={() => setMode(null)} disabled={loading}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNsecLogin}
              disabled={loading || !nsecInput.trim()}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default NostrLoginModal;
