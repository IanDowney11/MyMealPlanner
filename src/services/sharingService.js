import { supabase } from '../lib/supabase';

// Sharing Permissions Management

export async function getSharingPermissions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shopping_list_sharing_permissions')
      .select('*')
      .eq('receiver_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sharing permissions:', error);
    throw error;
  }
}

export async function addSharingPermission(senderEmail) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!senderEmail.trim()) {
      throw new Error('Sender email cannot be empty');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail.trim())) {
      throw new Error('Please enter a valid email address');
    }

    // Check if permission already exists
    const { data: existing } = await supabase
      .from('shopping_list_sharing_permissions')
      .select('id')
      .eq('receiver_user_id', user.id)
      .eq('sender_email', senderEmail.trim().toLowerCase())
      .single();

    if (existing) {
      throw new Error('Permission for this email already exists');
    }

    const permissionData = {
      receiver_user_id: user.id,
      sender_email: senderEmail.trim().toLowerCase()
    };

    const { data, error } = await supabase
      .from('shopping_list_sharing_permissions')
      .insert([permissionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding sharing permission:', error);
    throw error;
  }
}

export async function deleteSharingPermission(permissionId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('shopping_list_sharing_permissions')
      .delete()
      .eq('id', permissionId)
      .eq('receiver_user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting sharing permission:', error);
    throw error;
  }
}

// User Profile Management

export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{ id: user.id, ...updateData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Shopping List Sharing Functions

export async function shareShoppingList(receiverEmail, shoppingListItems, listName = 'Shared Shopping List') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current user's email
    const senderProfile = await getCurrentUserProfile();
    if (!senderProfile || !senderProfile.email) {
      throw new Error('Sender profile not found. Please update your profile first.');
    }

    console.log('Sender profile:', senderProfile);
    console.log('Receiver email:', receiverEmail);

    // Check if receiver email exists
    const { data: receiverProfile, error: receiverError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', receiverEmail.trim().toLowerCase())
      .single();

    console.log('Receiver profile:', receiverProfile, 'Error:', receiverError);

    if (!receiverProfile) {
      throw new Error('Receiver email not found. Make sure the user is registered.');
    }

    // Check if sharing is allowed
    const { data: permission, error: permissionError } = await supabase
      .from('shopping_list_sharing_permissions')
      .select('id')
      .eq('receiver_user_id', receiverProfile.id)
      .eq('sender_email', senderProfile.email.toLowerCase())
      .single();

    console.log('Permission check:', permission, 'Error:', permissionError);
    console.log('Looking for permission: receiver_user_id =', receiverProfile.id, 'sender_email =', senderProfile.email.toLowerCase());

    if (!permission) {
      throw new Error('You do not have permission to share shopping lists with this user.');
    }

    // Prepare items data
    const items = shoppingListItems.map(item => ({
      item_name: item.item_name,
      is_completed: item.is_completed || false
    }));

    const shareData = {
      sender_user_id: user.id,
      receiver_user_id: receiverProfile.id,
      sender_email: senderProfile.email.toLowerCase(),
      receiver_email: receiverEmail.trim().toLowerCase(),
      list_name: listName.trim(),
      items: items,
      processed: false
    };

    const { data, error } = await supabase
      .from('shared_shopping_lists')
      .insert([shareData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sharing shopping list:', error);
    throw error;
  }
}

export async function getReceivedSharedLists() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shared_shopping_lists')
      .select('*')
      .eq('receiver_user_id', user.id)
      .eq('processed', false)
      .order('shared_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching received shared lists:', error);
    throw error;
  }
}

export async function getSentSharedLists() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shared_shopping_lists')
      .select('*')
      .eq('sender_user_id', user.id)
      .order('shared_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sent shared lists:', error);
    throw error;
  }
}

export async function acceptSharedList(sharedListId, mergeWithExisting = true) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the shared list
    const { data: sharedList, error: fetchError } = await supabase
      .from('shared_shopping_lists')
      .select('*')
      .eq('id', sharedListId)
      .eq('receiver_user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!sharedList) throw new Error('Shared list not found');

    // Import the shopping list service to manage items
    const { getCurrentShoppingList, createShoppingList, addItemToShoppingList } = await import('./shoppingListService');

    let targetList = null;

    if (mergeWithExisting) {
      // Try to get existing list
      targetList = await getCurrentShoppingList();
    }

    // Create new list if none exists or not merging
    if (!targetList) {
      targetList = await createShoppingList(sharedList.list_name);
    }

    // Add items, avoiding duplicates
    const existingItems = targetList.shopping_list_items || [];
    const existingItemNames = existingItems.map(item =>
      item.item_name.toLowerCase().trim()
    );

    const addedItems = [];
    const skippedItems = [];

    for (const item of sharedList.items) {
      const itemNameLower = item.item_name.toLowerCase().trim();

      if (!existingItemNames.includes(itemNameLower)) {
        try {
          await addItemToShoppingList(targetList.id, item.item_name);
          addedItems.push(item.item_name);
        } catch (error) {
          console.error('Error adding item:', error);
          skippedItems.push(item.item_name);
        }
      } else {
        skippedItems.push(item.item_name);
      }
    }

    // Mark the shared list as processed
    const { error: updateError } = await supabase
      .from('shared_shopping_lists')
      .update({ processed: true })
      .eq('id', sharedListId)
      .eq('receiver_user_id', user.id);

    if (updateError) {
      console.error('Error marking shared list as processed:', updateError);
    }

    return {
      success: true,
      addedItems,
      skippedItems,
      targetList
    };
  } catch (error) {
    console.error('Error accepting shared list:', error);
    throw error;
  }
}

export async function rejectSharedList(sharedListId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Mark the shared list as processed (rejected)
    const { error } = await supabase
      .from('shared_shopping_lists')
      .update({ processed: true })
      .eq('id', sharedListId)
      .eq('receiver_user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting shared list:', error);
    throw error;
  }
}

// Helper Functions

export async function checkSharingPermission(senderEmail, receiverEmail) {
  try {
    const { data: receiverProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', receiverEmail.trim().toLowerCase())
      .single();

    if (!receiverProfile) {
      return false;
    }

    const { data: permission } = await supabase
      .from('shopping_list_sharing_permissions')
      .select('id')
      .eq('receiver_user_id', receiverProfile.id)
      .eq('sender_email', senderEmail.trim().toLowerCase())
      .single();

    return !!permission;
  } catch (error) {
    console.error('Error checking sharing permission:', error);
    return false;
  }
}

export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

// Debug function to help troubleshoot sharing issues
export async function debugSharingSetup(receiverEmail, senderEmail = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ Not authenticated');
      return;
    }

    console.log('🔍 Debug Sharing Setup');
    console.log('Current user ID:', user.id);
    console.log('Current user email:', user.email);

    // Check sender profile
    const senderProfile = await getCurrentUserProfile();
    console.log('👤 Sender profile:', senderProfile);

    if (!senderProfile) {
      console.log('⚠️ Creating sender profile...');
      await updateUserProfile({ email: user.email });
      const newProfile = await getCurrentUserProfile();
      console.log('✅ New sender profile:', newProfile);
    }

    // Check receiver profile
    const { data: receiverProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', receiverEmail.trim().toLowerCase())
      .single();

    console.log('👤 Receiver profile:', receiverProfile);

    if (!receiverProfile) {
      console.log('❌ Receiver profile not found. They need to log in first.');
      return;
    }

    // Check permissions
    const { data: permissions } = await supabase
      .from('shopping_list_sharing_permissions')
      .select('*')
      .eq('receiver_user_id', receiverProfile.id);

    console.log('🔐 All permissions for receiver:', permissions);

    const senderEmailToCheck = senderEmail || user.email;
    const { data: specificPermission } = await supabase
      .from('shopping_list_sharing_permissions')
      .select('*')
      .eq('receiver_user_id', receiverProfile.id)
      .eq('sender_email', senderEmailToCheck.toLowerCase())
      .single();

    console.log('🎯 Specific permission for sender:', specificPermission);

    if (specificPermission) {
      console.log('✅ Permission exists - sharing should work!');
    } else {
      console.log('❌ No permission found. Receiver needs to add sender email to permissions.');
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Database initialization
export async function initSharingDB() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Promise.resolve();
    }

    // Test if sharing tables exist and create user profile if needed
    const { error: tableError } = await supabase
      .from('shopping_list_sharing_permissions')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('Sharing tables error:', tableError);
    }

    // Ensure user profile exists
    const profile = await getCurrentUserProfile();
    if (!profile) {
      console.log('Creating user profile...');
      await updateUserProfile({
        email: user.email
      });
      console.log('User profile created');
    }

  } catch (error) {
    console.error('Error checking sharing tables:', error);
  }

  return Promise.resolve();
}