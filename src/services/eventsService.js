import { db } from '../lib/db';
import { queueSync } from './syncService';

export async function getEvents() {
  try {
    const events = await db.calendarEvents.toArray();
    // Sort by created_at descending
    events.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    // Add snake_case aliases for UI compat
    return events.map(event => ({
      ...event,
      monthly_pattern: event.monthlyPattern,
      monthly_week: event.monthlyWeek,
      monthly_day_of_week: event.monthlyDayOfWeek
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function saveEvent(event) {
  try {
    const now = new Date().toISOString();

    const eventData = {
      id: event.id || crypto.randomUUID(),
      title: event.title,
      type: event.type,
      date: event.date,
      monthlyPattern: event.monthlyPattern || event.monthly_pattern || null,
      monthlyWeek: event.monthlyWeek || event.monthly_week || null,
      monthlyDayOfWeek: event.monthlyDayOfWeek ?? event.monthly_day_of_week ?? null,
      // snake_case aliases for UI compat
      monthly_pattern: event.monthlyPattern || event.monthly_pattern || null,
      monthly_week: event.monthlyWeek || event.monthly_week || null,
      monthly_day_of_week: event.monthlyDayOfWeek ?? event.monthly_day_of_week ?? null,
      created_at: event.created_at || now,
      updatedAt: now
    };

    await db.calendarEvents.put(eventData);
    queueSync('event', eventData.id, event.id ? 'update' : 'create');

    return eventData;
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId) {
  try {
    await db.calendarEvents.delete(eventId);
    queueSync('event', eventId, 'delete');
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function getEventById(eventId) {
  try {
    const event = await db.calendarEvents.get(eventId);
    if (!event) return null;

    return {
      ...event,
      monthly_pattern: event.monthlyPattern,
      monthly_week: event.monthlyWeek,
      monthly_day_of_week: event.monthlyDayOfWeek
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

export async function getEventsForDate(date) {
  try {
    const events = await getEvents();
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const targetDate = new Date(dateStr);

    return events.filter(event => {
      if (event.type === 'one-time') {
        return event.date === dateStr;
      } else if (event.type === 'weekly') {
        const eventDate = new Date(event.date);
        return eventDate.getDay() === targetDate.getDay();
      } else if (event.type === 'monthly') {
        return matchesMonthlyPattern(event, targetDate);
      }
      return false;
    });
  } catch (error) {
    console.error('Error fetching events for date:', error);
    throw error;
  }
}

// Helper function to check if a date matches a monthly recurring pattern
function matchesMonthlyPattern(event, targetDate) {
  const monthlyPattern = event.monthly_pattern || event.monthlyPattern;

  if (monthlyPattern === 'date') {
    const eventDate = new Date(event.date);
    return targetDate.getDate() === eventDate.getDate();
  } else if (monthlyPattern === 'day-of-week') {
    const targetDayOfWeek = targetDate.getDay();
    const monthlyDayOfWeek = event.monthly_day_of_week ?? event.monthlyDayOfWeek;
    const monthlyWeek = event.monthly_week || event.monthlyWeek;

    if (targetDayOfWeek !== monthlyDayOfWeek) {
      return false;
    }

    return isCorrectWeekOfMonth(targetDate, monthlyWeek);
  }

  return false;
}

// Helper function to determine if a date is the correct week of the month
function isCorrectWeekOfMonth(date, weekPattern) {
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth();

  if (weekPattern === 'first') {
    return dayOfMonth >= 1 && dayOfMonth <= 7;
  } else if (weekPattern === 'second') {
    return dayOfMonth >= 8 && dayOfMonth <= 14;
  } else if (weekPattern === 'third') {
    return dayOfMonth >= 15 && dayOfMonth <= 21;
  } else if (weekPattern === 'fourth') {
    return dayOfMonth >= 22 && dayOfMonth <= 28;
  } else if (weekPattern === 'last') {
    const nextWeek = new Date(year, month, dayOfMonth + 7);
    return nextWeek.getMonth() !== month;
  }

  return false;
}
