# Test Script 02: Meal Management

**Focus**: Creating, editing, and managing meals on mobile
**Estimated Time**: 15 minutes

## Pre-requisites
- Logged in user
- Access to Meals page

---

## Test Case 2.1: View Meals List (Mobile)

**Steps**:
1. Navigate to Meals page
2. Scroll through meal list
3. Observe layout and interactions

**Expected Results**:
- [ ] Meal cards display properly in mobile view
- [ ] Images load and display correctly
- [ ] Text is readable without zooming
- [ ] Ratings visible clearly
- [ ] Tags display appropriately
- [ ] Recipe link icon visible and clickable
- [ ] Smooth scrolling experience

**Mobile-Specific Checks**:
- [ ] Cards are full-width or appropriately sized
- [ ] Touch targets are large enough
- [ ] No layout breaking or overflow issues
- [ ] Loading indicators show for images

---

## Test Case 2.2: Add New Meal (Mobile)

**Steps**:
1. Tap "Add Meal" button
2. Fill in meal details:
   - Title
   - Description
   - Rating
   - Image URL
   - Recipe URL
   - Tags
3. Tap "Save"

**Expected Results**:
- [ ] Add meal form displays properly on mobile
- [ ] All input fields are accessible
- [ ] Keyboard doesn't obscure inputs
- [ ] Can scroll form if needed
- [ ] Rating selector works with touch
- [ ] Tag input works properly
- [ ] Save button always accessible
- [ ] Meal saved successfully
- [ ] Returns to meal list

**Mobile-Specific Checks**:
- [ ] Form fits on screen without issues
- [ ] Can easily navigate between fields
- [ ] Image URL input has proper keyboard
- [ ] Tags can be added/removed easily
- [ ] No issues with virtual keyboard

---

## Test Case 2.3: Edit Existing Meal (Mobile)

**Steps**:
1. Tap on a meal card
2. Tap "Edit" button
3. Modify meal details
4. Save changes

**Expected Results**:
- [ ] Edit form opens properly
- [ ] Existing data pre-filled correctly
- [ ] Can modify all fields
- [ ] Changes save successfully
- [ ] Updated meal displays correctly

**Mobile-Specific Checks**:
- [ ] Edit button easily tappable
- [ ] Form scrollable on mobile
- [ ] No data loss when keyboard appears

---

## Test Case 2.4: Delete Meal (Mobile)

**Steps**:
1. Open meal details/edit
2. Tap "Delete" button
3. Confirm deletion

**Expected Results**:
- [ ] Delete button clearly visible
- [ ] Confirmation dialog appears
- [ ] Dialog readable on mobile
- [ ] Meal deleted on confirmation
- [ ] Returns to meal list
- [ ] Meal no longer appears

**Mobile-Specific Checks**:
- [ ] Confirmation buttons are large enough
- [ ] Cancel/Delete clearly distinguished

---

## Test Case 2.5: Recipe Link Functionality (Mobile)

**Steps**:
1. View a meal with recipe URL
2. Tap the link icon
3. Observe behavior

**Expected Results**:
- [ ] Link icon visible next to meal title
- [ ] Icon has adequate touch target size
- [ ] Tooltip shows on long press (if applicable)
- [ ] Link opens in new tab/window
- [ ] Opens with proper security attributes
- [ ] Can return to app easily

**Mobile-Specific Checks**:
- [ ] Icon doesn't overlap other elements
- [ ] Works in both meal list and planner views
- [ ] No accidental clicks on other elements

---

## Test Case 2.6: Add Meal Versions (Mobile)

**Steps**:
1. Edit a meal
2. Add version descriptions
3. Test version display

**Expected Results**:
- [ ] Can add multiple versions
- [ ] Version input works on mobile
- [ ] Versions display in meal card
- [ ] Version count shown correctly
- [ ] Can select version when planning

**Mobile-Specific Checks**:
- [ ] Version list scrollable if many
- [ ] Add/remove version buttons work well

---

## Test Case 2.7: Freezer Portions (Mobile)

**Steps**:
1. Edit a meal
2. Set freezer portions count
3. View in meal list and planner

**Expected Results**:
- [ ] Can set freezer portions easily
- [ ] Number input works on mobile
- [ ] Freezer badge displays in sidebar
- [ ] "From Freezer" chip shows when planned
- [ ] Portion count accurate

**Mobile-Specific Checks**:
- [ ] Number keyboard appears
- [ ] Increment/decrement easy to use

---

## Test Case 2.8: Meal Search/Filter (Mobile)

**Steps**:
1. Use search or filter functionality
2. Enter search terms or select filters
3. View filtered results

**Expected Results**:
- [ ] Search/filter UI accessible on mobile
- [ ] Keyboard works properly for search
- [ ] Filter chips/tags work with touch
- [ ] Results update in real-time
- [ ] Can clear filters easily

**Mobile-Specific Checks**:
- [ ] Search bar appropriately sized
- [ ] Filter UI doesn't take too much space
- [ ] Results list scrollable

---

## Issues Found

| Issue # | Description | Severity | Screenshot |
|---------|-------------|----------|------------|
| | | | |

---

## Recommendations

-
-
