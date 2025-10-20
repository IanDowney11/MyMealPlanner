# Shopping List Sharing Feature

This document explains how to use the new shopping list sharing functionality in the MyMealPlanner application.

## Overview

The shopping list sharing feature allows users to privately share their shopping lists with other registered users. The system requires explicit permission from the receiver before any sharing can occur.

## Key Features

1. **Private Sharing**: Users must explicitly grant permission to allow others to share lists with them
2. **Email-based Sharing**: Users are identified by their email addresses
3. **Duplicate Prevention**: When merging shared lists, duplicate items are automatically skipped
4. **Permission Management**: Full control over who can send you shopping lists

## How It Works

### For Receivers (Setting Up Permissions)

1. Navigate to the Shopping List page
2. Scroll down to the sharing section with tabs
3. Click on the "Sharing Permissions" tab
4. Add the email addresses of users you want to allow to share lists with you
5. Manage (add/remove) permissions as needed

### For Senders (Sharing a List)

1. Create a shopping list with items
2. Click the "Share" button in the shopping list header
3. Enter the email address of the person you want to share with
4. Click "Share List"
5. The recipient must have already given you permission

### For Receivers (Accepting Shared Lists)

1. Navigate to the Shopping List page
2. Check the "Shared Lists Inbox" tab for incoming lists
3. Preview shared lists to see their contents
4. Choose to merge with existing list or create new one
5. Accept or reject the shared list

## Database Schema

The sharing system uses three main tables:

1. **shopping_list_sharing_permissions**: Stores who can share with whom
2. **shared_shopping_lists**: Stores the actual shared lists awaiting processing
3. **user_profiles**: Stores user email addresses for lookup

## Security Features

- Row Level Security (RLS) ensures users can only see their own data
- Permission-based sharing prevents unwanted list sharing
- Email validation and user verification
- Secure database functions for cross-user operations

## API Functions

### Sharing Service Functions

- `getSharingPermissions()`: Get current sharing permissions
- `addSharingPermission(email)`: Allow a user to share with you
- `deleteSharingPermission(id)`: Remove sharing permission
- `shareShoppingList(email, items, name)`: Share your list with someone
- `getReceivedSharedLists()`: Get lists shared with you
- `acceptSharedList(id, merge)`: Accept a shared list
- `rejectSharedList(id)`: Reject a shared list

### Permission Checking

- `checkSharingPermission(sender, receiver)`: Verify if sharing is allowed
- `getUserByEmail(email)`: Find user by email address

## Setup Instructions

1. **Database Setup**: Run the `shopping_list_sharing_schema.sql` script in your Supabase database
2. **User Profiles**: The system automatically creates user profiles when users sign up
3. **RLS Policies**: Ensure Row Level Security is enabled on all sharing tables

## Testing the Feature

### Test Scenario 1: Permission Setup
1. User A grants permission to User B's email
2. Verify User B can now share lists with User A
3. Test that User C cannot share with User A (no permission)

### Test Scenario 2: Sharing Workflow
1. User B creates a shopping list with multiple items
2. User B shares the list with User A (who has granted permission)
3. User A receives the shared list in their inbox
4. User A previews and accepts the list
5. Verify items are added without duplicates

### Test Scenario 3: Permission Revocation
1. User A removes permission for User B
2. Verify User B can no longer share lists with User A
3. Test appropriate error messages are shown

## Error Handling

The system provides clear error messages for common scenarios:
- "You do not have permission to share shopping lists with this user"
- "Receiver email not found. Make sure the user is registered"
- "Permission for this email already exists"
- "Please enter a valid email address"

## UI Components

### SharingPermissions Component
- Manages who can share lists with the current user
- Add/remove email addresses
- Visual list of current permissions

### SharedListInbox Component
- Shows incoming shared lists
- Preview functionality
- Accept/reject options
- Merge vs. new list choice

### Share Dialog
- Simple email input for sharing
- Validation and error handling
- Progress indicators

## Notes

- Users must be registered in the system to participate in sharing
- Email addresses are case-insensitive and automatically normalized
- Shared lists are marked as "processed" after acceptance or rejection
- The system maintains a history of shared lists for auditing purposes

## Future Enhancements

Potential improvements could include:
- Notification system for new shared lists
- Sharing groups or family accounts
- Scheduled sharing for recurring lists
- Integration with meal planning for automatic ingredient sharing