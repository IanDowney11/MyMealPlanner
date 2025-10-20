/**
 * Haptic feedback utility for mobile devices
 * Provides vibration feedback for user interactions
 */

export const haptic = {
  /**
   * Light tap feedback (10ms)
   * Use for: button taps, toggles, selections
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium feedback (25ms)
   * Use for: item added, item completed, action confirmed
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },

  /**
   * Success feedback pattern (short-pause-short)
   * Use for: successful save, successful submit
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 50, 15]);
    }
  },

  /**
   * Error feedback pattern (longer vibration)
   * Use for: errors, validation failures
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },

  /**
   * Warning feedback (single medium pulse)
   * Use for: confirmations, warnings
   */
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }
  },

  /**
   * Delete feedback (double tap)
   * Use for: item deleted
   */
  delete: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
  }
};
