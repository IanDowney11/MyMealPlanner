import React from 'react';
import { Box, Chip, CircularProgress } from '@mui/material';
import {
  Sync as SyncIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material';
import { useSyncStatus } from '../contexts/SyncContext';

function SyncStatusIndicator() {
  const ctx = useSyncStatus();

  // Context not available (not wrapped in SyncProvider or no nsec login)
  if (!ctx) return null;

  const { syncStatus, retry } = ctx;

  if (syncStatus === 'idle') return null;

  if (syncStatus === 'syncing') {
    return (
      <Box sx={{ px: 3, py: 0.5 }}>
        <Chip
          icon={<CircularProgress size={14} color="inherit" />}
          label="Syncing..."
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      </Box>
    );
  }

  if (syncStatus === 'synced') {
    return (
      <Box sx={{ px: 3, py: 0.5 }}>
        <Chip
          icon={<CheckIcon sx={{ fontSize: 14 }} />}
          label="Synced"
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      </Box>
    );
  }

  if (syncStatus === 'error') {
    return (
      <Box sx={{ px: 3, py: 0.5 }}>
        <Chip
          icon={<WarningIcon sx={{ fontSize: 14 }} />}
          label="Sync error"
          size="small"
          color="warning"
          variant="outlined"
          onClick={retry}
          sx={{ fontSize: '0.7rem', height: 24, cursor: 'pointer' }}
        />
      </Box>
    );
  }

  return null;
}

export default SyncStatusIndicator;
