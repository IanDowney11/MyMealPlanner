import { supabase } from '../lib/supabase';

export async function getEvents() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function saveEvent(event) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const eventData = {
      user_id: user.id,
      title: event.title,
      type: event.type,
      date: event.date,
      updated_at: new Date().toISOString()
    };

    // Only include ID for updates, not for new inserts
    if (event.id) {
      eventData.id = event.id;
    }

    // If event has an ID, update it; otherwise, create new
    let result;
    if (event.id) {
      // Update existing event
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', event.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new event
      eventData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function getEventById(eventId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

export async function getEventsForDate(date) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const events = await getEvents();
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const targetDate = new Date(dateStr);

    return events.filter(event => {
      if (event.type === 'one-time') {
        return event.date === dateStr;
      } else if (event.type === 'weekly') {
        // Check if it's the same day of the week
        const eventDate = new Date(event.date);
        return eventDate.getDay() === targetDate.getDay();
      }
      return false;
    });
  } catch (error) {
    console.error('Error fetching events for date:', error);
    throw error;
  }
}