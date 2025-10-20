# Test Script 04: Shopping List

**Focus**: Shopping list creation and management on mobile
**Estimated Time**: 15 minutes

## Pre-requisites
- Logged in user
- Some frequent items configured

---

## Test Case 4.1: View Shopping List Page (Mobile)

**Steps**:
1. Navigate to Shopping List page
2. Observe layout
3. Scroll through sections

**Expected Results**:
- [ ] Page title visible
- [ ] Shopping list section displayed first (mobile priority)
- [ ] Frequent items section below
- [ ] Sharing section at bottom
- [ ] Layout stacks properly on mobile
- [ ] Smooth scrolling

**Mobile-Specific Checks**:
- [ ] Sections full-width on mobile
- [ ] Cards properly spaced
- [ ] Headers readable
- [ ] No horizontal overflow

---

## Test Case 4.2: Create New Shopping List (Mobile)

**Steps**:
1. If no active list, tap "Create Shopping List"
2. Observe creation

**Expected Results**:
- [ ] Create button clearly visible
- [ ] Button properly sized for touch
- [ ] List creates successfully
- [ ] Success feedback shown
- [ ] List interface appears

**Mobile-Specific Checks**:
- [ ] Button centered and prominent
- [ ] Loading state visible if needed

---

## Test Case 4.3: Add Items to Shopping List (Mobile)

**Steps**:
1. Type item name in input field
2. Tap "Add" button or press Enter
3. Repeat for multiple items

**Expected Results**:
- [ ] Input field easily accessible
- [ ] Keyboard appears correctly
- [ ] Can type without issues
- [ ] Add button clearly visible
- [ ] Item appears in pending section
- [ ] Input clears after adding
- [ ] No duplicates allowed (shows alert)

**Mobile-Specific Checks**:
- [ ] Input and button layout on mobile (stacked)
- [ ] Keyboard doesn't obscure button
- [ ] Enter key on keyboard works
- [ ] Touch targets adequate size

---

## Test Case 4.4: Add from Frequent Items (Mobile)

**Steps**:
1. Scroll to frequent items section
2. Tap a frequent item
3. Observe it added to active list

**Expected Results**:
- [ ] Frequent items list visible
- [ ] Each item has add icon
- [ ] Tapping item adds to shopping list
- [ ] Item appears in pending section
- [ ] Visual feedback on add
- [ ] Duplicate prevention works

**Mobile-Specific Checks**:
- [ ] List items full-width
- [ ] Add icon visible and tappable
- [ ] No accidental double-taps
- [ ] Smooth scrolling between sections

---

## Test Case 4.5: Check/Uncheck Items (Mobile)

**Steps**:
1. Tap checkbox next to pending item
2. Observe item move to completed section
3. Tap checkbox on completed item
4. Observe item return to pending

**Expected Results**:
- [ ] Checkbox easily tappable
- [ ] Visual feedback immediate
- [ ] Item moves to correct section
- [ ] Strikethrough applied to completed
- [ ] Color/style changes visible
- [ ] Stats update (pending/completed count)

**Mobile-Specific Checks**:
- [ ] Checkbox touch target adequate (56x56px area)
- [ ] Smooth animation between sections
- [ ] Divider between sections visible
- [ ] Scrolling works after reorder

---

## Test Case 4.6: Delete Individual Items (Mobile)

**Steps**:
1. Tap delete icon on an item
2. Observe removal

**Expected Results**:
- [ ] Delete icon clearly visible
- [ ] Icon has adequate touch target
- [ ] Item removed immediately
- [ ] No confirmation needed (or confirm if desired)
- [ ] Stats update

**Mobile-Specific Checks**:
- [ ] Delete button positioned clearly (right side)
- [ ] Icon size appropriate for mobile
- [ ] No accidental deletes
- [ ] Visual feedback on tap

---

## Test Case 4.7: Clear All Checked Items (Mobile)

**Steps**:
1. Check several items
2. Tap "Clear Checked" button in header
3. Confirm action

**Expected Results**:
- [ ] "Clear Checked" button visible in header
- [ ] Button disabled when no checked items
- [ ] Button enabled when items checked
- [ ] Confirmation dialog appears
- [ ] Dialog shows count of items to remove
- [ ] All checked items removed on confirm
- [ ] Unchecked items remain
- [ ] List stays active

**Mobile-Specific Checks**:
- [ ] Button wraps properly with other header buttons
- [ ] Button text readable (may need short label)
- [ ] Confirmation dialog readable
- [ ] Dialog buttons distinct (Cancel/Confirm)

---

## Test Case 4.8: Complete Shopping List (Mobile)

**Steps**:
1. Tap "Complete" button
2. Confirm deletion
3. Observe list removal

**Expected Results**:
- [ ] Complete button visible
- [ ] Confirmation dialog clear
- [ ] Warns that entire list will be deleted
- [ ] List deleted on confirmation
- [ ] Returns to empty state
- [ ] Can create new list

**Mobile-Specific Checks**:
- [ ] Button accessible in header
- [ ] Dialog warning clear
- [ ] Easy to cancel if mistaken

---

## Test Case 4.9: Share Shopping List (Mobile)

**Steps**:
1. Tap "Share" button
2. Enter recipient email
3. Send

**Expected Results**:
- [ ] Share button visible
- [ ] Share dialog opens
- [ ] Email input accessible
- [ ] Keyboard appropriate type (email)
- [ ] Can send successfully
- [ ] Success/error message shown
- [ ] Dialog closes

**Mobile-Specific Checks**:
- [ ] Dialog sized for mobile
- [ ] Email input full-width
- [ ] Send button always visible
- [ ] Cancel button accessible

---

## Test Case 4.10: Manage Frequent Items (Mobile)

**Steps**:
1. Scroll to frequent items section
2. Add new frequent item
3. Delete a frequent item

**Expected Results**:
- [ ] Can add new frequent items
- [ ] Input and button work properly
- [ ] No duplicates allowed
- [ ] Can delete items easily
- [ ] Delete icon visible
- [ ] Confirmation not needed (quick action)

**Mobile-Specific Checks**:
- [ ] Input/button layout stacks on mobile
- [ ] List scrollable
- [ ] Delete icons properly sized

---

## Test Case 4.11: Sharing Permissions (Mobile)

**Steps**:
1. Scroll to sharing section
2. Switch to "Sharing Permissions" tab
3. Add/remove permissions

**Expected Results**:
- [ ] Tabs visible and tappable
- [ ] Tab content switches smoothly
- [ ] Can add email addresses
- [ ] Can view permissions list
- [ ] Can delete permissions
- [ ] UI updates properly

**Mobile-Specific Checks**:
- [ ] Tabs full-width
- [ ] Active tab clearly indicated
- [ ] Content area appropriately sized
- [ ] Forms work on mobile

---

## Test Case 4.12: Shared Lists Inbox (Mobile)

**Steps**:
1. View shared lists inbox tab
2. Accept or reject a shared list

**Expected Results**:
- [ ] Inbox shows received lists
- [ ] List details visible
- [ ] Accept/Reject buttons clear
- [ ] Merge option works
- [ ] List added to active list or new list
- [ ] Feedback shown

**Mobile-Specific Checks**:
- [ ] List cards readable
- [ ] Action buttons properly sized
- [ ] Dialog/options clear

---

## Test Case 4.13: Shopping List Stats Display (Mobile)

**Steps**:
1. View shopping list with items
2. Observe stat chips

**Expected Results**:
- [ ] Pending count chip visible
- [ ] Completed count chip visible
- [ ] Icons appropriate
- [ ] Numbers update in real-time
- [ ] Chips color-coded

**Mobile-Specific Checks**:
- [ ] Chips sized appropriately
- [ ] Wrap properly if needed
- [ ] Center or left-aligned appropriately

---

## Issues Found

| Issue # | Description | Severity | Screenshot |
|---------|-------------|----------|------------|
| | | | |

---

## Recommendations

-
-
