import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * Progressive Image Component
 * Displays a skeleton loader while image is loading
 * Supports lazy loading for off-screen images
 */
function ProgressiveImage({
  src,
  alt,
  width = 50,
  height = 50,
  sx = {},
  variant = 'rounded',
  fallbackIcon = '🥘',
  lazy = true
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      setError(true);
      return;
    }

    // Reset state when src changes
    setLoading(true);
    setError(false);

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Show skeleton while loading
  if (loading) {
    return (
      <Skeleton
        variant={variant}
        width={width}
        height={height}
        animation="wave"
        sx={sx}
      />
    );
  }

  // Show fallback if error or no src
  if (error || !imageSrc) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: variant === 'rounded' ? 1 : variant === 'circular' ? '50%' : 0,
          fontSize: typeof width === 'number' ? `${width * 0.4}px` : '20px',
          ...sx
        }}
      >
        {fallbackIcon}
      </Box>
    );
  }

  // Show loaded image
  return (
    <Box
      component="img"
      src={imageSrc}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      sx={{
        width,
        height,
        objectFit: 'cover',
        borderRadius: variant === 'rounded' ? 1 : variant === 'circular' ? '50%' : 0,
        ...sx
      }}
    />
  );
}

export default ProgressiveImage;
