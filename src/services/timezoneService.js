import { supabase } from '../lib/supabase';

const TIMEZONE_STORAGE_KEY = 'user_timezone';

// Get all available timezones
export function getAvailableTimezones() {
  // Using Intl.supportedValuesOf if available (modern browsers)
  if (Intl.supportedValuesOf) {
    return Intl.supportedValuesOf('timeZone');
  }

  // Fallback to common timezones
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

// Get the user's timezone from storage or database
export async function getUserTimezone() {
  try {
    // First, check if user is authenticated and has a stored preference in DB
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('timezone')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.timezone) {
        // Store in localStorage for quick access
        localStorage.setItem(TIMEZONE_STORAGE_KEY, data.timezone);
        return data.timezone;
      }
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
    // Fall back to browser's timezone
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

    // If user is authenticated, save to database
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            timezone,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('user_settings')
          .insert([{
            user_id: user.id,
            timezone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }
    }

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
    // Get the date string in the user's timezone
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

    // Parse and create a date assuming it's in the specified timezone
    const [datePart, timePart] = dateStr.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    // Create date in user timezone then convert to UTC
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
  const tzDate = typeof date === 'string' ? utcToUserTimezone(date, timezone) : date;

  const year = tzDate.getFullYear();
  const month = String(tzDate.getMonth() + 1).padStart(2, '0');
  const day = String(tzDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Get today's date in YYYY-MM-DD format in user's timezone
export async function getTodayInUserTimezone() {
  const timezone = await getUserTimezone();
  const now = new Date();

  // Format in user's timezone
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

  // Create a date string in the user's timezone at midnight
  const tzDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;

  // Parse as if it's in the user's timezone
  const date = new Date(tzDateStr);

  // Get offset for this timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const tzYear = parts.find(p => p.type === 'year').value;
  const tzMonth = parts.find(p => p.type === 'month').value;
  const tzDay = parts.find(p => p.type === 'day').value;

  // Create date in local time, then adjust for timezone
  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);

  return localDate.toISOString();
}
