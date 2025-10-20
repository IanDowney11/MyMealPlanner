# Test Script 03: Meal Planner

**Focus**: Weekly meal planning functionality on mobile
**Estimated Time**: 20 minutes

## Pre-requisites
- Logged in user
- At least 5 meals in database
- Some meals with versions and freezer portions

---

## Test Case 3.1: View Meal Planner (Mobile)

**Steps**:
1. Navigate to Meal Planner page
2. Observe initial layout
3. Try scrolling in different directions

**Expected Results**:
- [ ] Weekly calendar displays properly
- [ ] Current week highlighted/indicated
- [ ] Day cards arranged vertically on mobile
- [ ] All 7 days visible
- [ ] Week navigation buttons visible
- [ ] No horizontal scrolling required (except intentional)
- [ ] Loads within acceptable time

**Mobile-Specific Checks**:
- [ ] Calendar fits screen width
- [ ] Day cards are appropriately sized
- [ ] Touch-friendly spacing between elements
- [ ] Header stays visible when scrolling

---

## Test Case 3.2: Toggle Available Meals Sidebar (Mobile)

**Steps**:
1. Tap the burger menu icon (meal planner sidebar)
2. Observe sidebar behavior
3. Close sidebar
4. Reopen sidebar

**Expected Results**:
- [ ] Sidebar burger icon visible and distinct from main nav
- [ ] No overlap with main navigation burger icon
- [ ] Sidebar slides in smoothly
- [ ] Sidebar overlays calendar (doesn't push it)
- [ ] Backdrop/overlay appears
- [ ] Can close by tapping backdrop
- [ ] Can close with close button
- [ ] Sidebar shows "Available Meals" list

**Mobile-Specific Checks**:
- [ ] Icon has adequate left margin (ml: 6)
- [ ] Sidebar takes appropriate width
- [ ] Smooth animation
- [ ] z-index correct (sidebar above content)
- [ ] Can still see calendar partially

---

## Test Case 3.3: Add Meal to Day (Mobile - Tap Method)

**Steps**:
1. Open meals sidebar
2. Tap on a meal without versions
3. Select a day from modal
4. Confirm assignment

**Expected Results**:
- [ ] Tapping meal opens day selection modal
- [ ] Modal displays all 7 days
- [ ] Can scroll through days if needed
- [ ] Day names clearly visible
- [ ] Can select a day easily
- [ ] Meal appears on selected day
- [ ] Modal closes automatically
- [ ] Sidebar closes on mobile

**Mobile-Specific Checks**:
- [ ] Modal sized appropriately
- [ ] Day buttons large enough to tap
- [ ] Clear visual feedback on selection
- [ ] No accidental double-taps

---

## Test Case 3.4: Add Meal with Versions (Mobile)

**Steps**:
1. Tap meal with multiple versions
2. Select version from modal
3. Select day
4. Confirm

**Expected Results**:
- [ ] Version selection modal appears first
- [ ] All versions listed clearly
- [ ] Can select a version easily
- [ ] Then day selection modal appears
- [ ] Selected version shown in meal card
- [ ] Version name visible but not too long

**Mobile-Specific Checks**:
- [ ] Two-step modal flow clear
- [ ] Version descriptions readable
- [ ] Adequate spacing between versions

---

## Test Case 3.5: View Planned Meal Details (Mobile)

**Steps**:
1. Tap on a planned meal card
2. Observe meal details
3. Tap recipe link if available

**Expected Results**:
- [ ] Meal card shows all key info:
  - Title
  - Image
  - Rating
  - Selected version (if any)
  - Fresh vs Freezer indicator
  - Tags
  - Recipe link icon
- [ ] Recipe link opens in new tab
- [ ] All text readable
- [ ] Card not too cramped

**Mobile-Specific Checks**:
- [ ] Card content well-organized
- [ ] Link icon doesn't overlap
- [ ] Badges/chips properly sized
- [ ] Image aspect ratio correct

---

## Test Case 3.6: Remove Meal from Day (Mobile)

**Steps**:
1. Find a day with planned meal
2. Tap the X/close button on meal card
3. Observe removal

**Expected Results**:
- [ ] Remove button clearly visible
- [ ] Button has adequate touch target
- [ ] Confirmation prompt (optional)
- [ ] Meal removed immediately
- [ ] Day shows empty state
- [ ] Can drag another meal

**Mobile-Specific Checks**:
- [ ] Button positioned clearly (top-right)
- [ ] Doesn't interfere with other interactions
- [ ] Visual feedback on tap

---

## Test Case 3.7: Week Navigation (Mobile)

**Steps**:
1. Tap "Next Week" button
2. Observe week change
3. Tap "Last Week" button
4. Tap week indicator chip to return to current week

**Expected Results**:
- [ ] Navigation buttons clearly visible
- [ ] Week changes smoothly
- [ ] Current week indicator updates
- [ ] Date range updates
- [ ] Planned meals load for new week
- [ ] Can navigate multiple weeks forward/back
- [ ] "This Week" indicator shows correctly

**Mobile-Specific Checks**:
- [ ] Buttons sized appropriately
- [ ] Week label/chip readable
- [ ] Navigation controls wrap properly on small screens
- [ ] No layout breaking

---

## Test Case 3.8: Copy Last Week (Mobile)

**Steps**:
1. Plan meals for current week
2. Navigate to next week
3. Navigate back to current week
4. Tap "Copy Last Week" button
5. Confirm action

**Expected Results**:
- [ ] Button only shows on current week
- [ ] Confirmation dialog appears
- [ ] Dialog explains action clearly
- [ ] Can cancel easily
- [ ] On confirm, last week's meals copied
- [ ] Success message shown
- [ ] Calendar updates with copied meals

**Mobile-Specific Checks**:
- [ ] Button wraps properly with other controls
- [ ] Confirmation dialog readable
- [ ] Action buttons distinct

---

## Test Case 3.9: Tag Filter in Sidebar (Mobile)

**Steps**:
1. Open meals sidebar
2. Use tag filter autocomplete
3. Select one or more tags
4. Observe filtered results
5. Clear filter

**Expected Results**:
- [ ] Tag filter visible in sidebar
- [ ] Autocomplete dropdown works
- [ ] Can select multiple tags
- [ ] Meals filter in real-time
- [ ] Selected tags displayed as chips
- [ ] Can remove individual tags
- [ ] "Clear Tags" button works
- [ ] All meals show when cleared

**Mobile-Specific Checks**:
- [ ] Autocomplete dropdown sized correctly
- [ ] Tag chips wrap properly
- [ ] Easy to remove tags
- [ ] Filter doesn't take too much space

---

## Test Case 3.10: Add Event to Day (Mobile)

**Steps**:
1. Tap "+" icon on a day card
2. Enter event details
3. Save event
4. View event on calendar

**Expected Results**:
- [ ] Add event button visible
- [ ] Event modal opens
- [ ] Can enter title easily
- [ ] Optional description field works
- [ ] Date pre-selected correctly
- [ ] Event saves successfully
- [ ] Event chip appears on day
- [ ] Event icon visible

**Mobile-Specific Checks**:
- [ ] Modal keyboard-friendly
- [ ] Form fields accessible
- [ ] Save button always reachable

---

## Test Case 3.11: Edit/Delete Event (Mobile)

**Steps**:
1. Tap on event chip
2. Select edit or delete
3. Make changes or confirm deletion

**Expected Results**:
- [ ] Context menu appears
- [ ] Edit and Delete options clear
- [ ] Edit opens modal with data
- [ ] Delete confirms before removing
- [ ] Changes save properly

**Mobile-Specific Checks**:
- [ ] Context menu properly positioned
- [ ] Menu doesn't go off-screen
- [ ] Options tappable

---

## Test Case 3.12: Freezer Portion Handling (Mobile)

**Steps**:
1. Add meal with freezer portions to calendar
2. Observe indicator
3. Check meal details

**Expected Results**:
- [ ] "From Fridge/Freezer" chip shows
- [ ] Chip color distinct from "Cook Fresh"
- [ ] Freezer emoji visible
- [ ] Count updates when meal used
- [ ] Indicator accurate

**Mobile-Specific Checks**:
- [ ] Chip readable on mobile
- [ ] Emoji renders correctly
- [ ] Doesn't overflow card

---

## Test Case 3.13: Landscape Orientation (Mobile)

**Steps**:
1. Rotate device to landscape
2. Test all planner interactions
3. Rotate back to portrait

**Expected Results**:
- [ ] Layout adapts to landscape
- [ ] Calendar still usable
- [ ] Sidebar behavior appropriate
- [ ] No major layout issues
- [ ] Can switch orientations smoothly

**Mobile-Specific Checks**:
- [ ] Day cards layout optimally
- [ ] Text still readable
- [ ] Controls accessible

---

## Issues Found

| Issue # | Description | Severity | Screenshot |
|---------|-------------|----------|------------|
| | | | |

---

## Recommendations

-
-
