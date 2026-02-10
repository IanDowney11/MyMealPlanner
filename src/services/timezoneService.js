import { db } from '../lib/db';

const TIMEZONE_STORAGE_KEY = 'user_timezone';

// Get all available timezones
export function getAvailableTimezones() {
  if (Intl.supportedValuesOf) {
    return Intl.supportedValuesOf('timeZone');
  }

  return [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Phoenix',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'Asia/Dubai',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
  ];
}

// Get the user's timezone from Dexie settings or localStorage
export async function getUserTimezone() {
  try {
    // Check Dexie settings first
    const setting = await db.settings.get('timezone');
    if (setting?.value) {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, setting.value);
      return setting.value;
    }

    // Fall back to localStorage
    const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Fall back to browser's timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

// Save the user's timezone preference
export async function setUserTimezone(timezone) {
  try {
    // Validate timezone
    try {
      Intl.DateTimeFormat('en-US', { timeZone: timezone });
    } catch (e) {
      throw new Error('Invalid timezone');
    }

    // Store in localStorage
    localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone);

    // Store in Dexie settings
    await db.settings.put({ key: 'timezone', value: timezone });

    return true;
  } catch (error) {
    console.error('Error saving timezone:', error);
    throw error;
  }
}

// Convert a UTC date string to user's timezone
export function utcToUserTimezone(utcDateStr, timezone) {
  try {
    const date = new Date(utcDateStr);
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  } catch (error) {
    console.error('Error converting UTC to user timezone:', error);
    return new Date(utcDateStr);
  }
}

// Convert a date in user's timezone to UTC
export function userTimezoneToUtc(date, timezone) {
  try {
    const dateStr = date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const [datePart, timePart] = dateStr.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    const tzDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    const utcDate = new Date(tzDate.toLocaleString('en-US', { timeZone: 'UTC' }));

    return utcDate;
  } catch (error) {
    console.error('Error converting user timezone to UTC:', error);
    return date;
  }
}

// Format a date as YYYY-MM-DD in the user's timezone
export async function formatDateInUserTimezone(date) {
  const timezone = await getUserTimezone();

  // Always use toLocaleString with timezone to get the correct date components
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateStr = dateObj.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

// Get today's date in YYYY-MM-DD format in user's timezone
export async function getTodayInUserTimezone() {
  const timezone = await getUserTimezone();
  const now = new Date();

  const dateStr = now.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const [month, day, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

// Parse a YYYY-MM-DD string as a date in the user's timezone and return UTC
export async function parseDateInUserTimezone(dateStr) {
  const timezone = await getUserTimezone();
  const [year, month, day] = dateStr.split('-').map(Number);

  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);

  return localDate.toISOString();
}
