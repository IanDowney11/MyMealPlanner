# Test Script 05: Navigation & Mobile UX

**Focus**: Navigation, responsiveness, and general mobile user experience
**Estimated Time**: 10 minutes

## Pre-requisites
- Logged in user
- Access to all pages

---

## Test Case 5.1: Main Navigation Drawer (Mobile)

**Steps**:
1. Tap hamburger menu icon (main navigation)
2. Observe drawer behavior
3. Navigate to different pages
4. Close drawer

**Expected Results**:
- [ ] Menu icon visible in top-left
- [ ] Touch target adequate size
- [ ] Drawer slides in from left
- [ ] Drawer overlays content
- [ ] Backdrop/overlay appears
- [ ] All navigation items visible:
  - Home
  - Meals
  - Snacks
  - Meal Planner
  - Shopping List
  - Admin
- [ ] Active page highlighted
- [ ] Can close by tapping backdrop
- [ ] Can close with chevron button

**Mobile-Specific Checks**:
- [ ] Drawer width appropriate (280px)
- [ ] Smooth animation
- [ ] Icons visible and aligned
- [ ] Text readable
- [ ] Touch targets for nav items adequate

---

## Test Case 5.2: Navigation Item Selection (Mobile)

**Steps**:
1. Open navigation drawer
2. Tap each navigation item
3. Verify page loads
4. Check drawer auto-closes

**Expected Results**:
- [ ] Tapping nav item navigates to page
- [ ] Drawer closes automatically on mobile
- [ ] Page loads successfully
- [ ] Active item highlighted correctly
- [ ] Smooth transition
- [ ] No loading delays

**Mobile-Specific Checks**:
- [ ] No double-tap required
- [ ] Visual feedback on tap
- [ ] Page title updates

---

## Test Case 5.3: User Profile Section (Mobile)

**Steps**:
1. Open navigation drawer
2. Scroll to bottom
3. View user profile section
4. Tap logout

**Expected Results**:
- [ ] Profile section visible at bottom
- [ ] User name/email displayed
- [ ] Logout button accessible
- [ ] Logout confirmation appears
- [ ] Successfully logs out
- [ ] Redirects to landing page

**Mobile-Specific Checks**:
- [ ] Profile section always visible (sticky or accessible)
- [ ] Logout button clearly visible
- [ ] Adequate spacing

---

## Test Case 5.4: Back Navigation (Mobile)

**Steps**:
1. Navigate through multiple pages
2. Use browser back button
3. Observe navigation

**Expected Results**:
- [ ] Back button works correctly
- [ ] Returns to previous page
- [ ] State preserved where appropriate
- [ ] No broken navigation loops

**Mobile-Specific Checks**:
- [ ] Mobile browser back button works
- [ ] Gesture navigation works (swipe back)

---

## Test Case 5.5: Page Scrolling (Mobile)

**Steps**:
1. Visit each page
2. Scroll content
3. Test header behavior

**Expected Results**:
- [ ] Smooth scrolling on all pages
- [ ] No sticky elements blocking content
- [ ] Can reach all content
- [ ] Scroll position maintained on navigation
- [ ] No rubber banding issues

**Mobile-Specific Checks**:
- [ ] Touch scroll responsive
- [ ] Momentum scrolling works
- [ ] Pull-to-refresh doesn't interfere

---

## Test Case 5.6: Landscape Mode (Mobile)

**Steps**:
1. Rotate device to landscape
2. Visit each major page
3. Test interactions
4. Rotate back to portrait

**Expected Results**:
- [ ] Layout adapts to landscape
- [ ] Content remains accessible
- [ ] Navigation drawer works
- [ ] Forms still usable
- [ ] No major layout breaks
- [ ] Orientation change smooth

**Mobile-Specific Checks**:
- [ ] Calendar layout optimized
- [ ] Meal cards arrange properly
- [ ] Modals sized correctly
- [ ] Virtual keyboard behavior ok

---

## Test Case 5.7: Touch Target Sizes (Mobile)

**Steps**:
1. Navigate to each page
2. Test all interactive elements
3. Verify minimum sizes

**Expected Results**:
- [ ] All buttons minimum 44x44px touch target
- [ ] Links tappable without zoom
- [ ] Checkboxes easily selectable
- [ ] Icons have adequate padding
- [ ] No accidental taps on adjacent elements

**Mobile-Specific Checks**:
- [ ] Spacing between touch targets adequate
- [ ] No cramped UI areas
- [ ] Fat finger friendly

---

## Test Case 5.8: Loading States (Mobile)

**Steps**:
1. Navigate between pages
2. Observe loading indicators
3. Test slow network (throttle if possible)

**Expected Results**:
- [ ] Loading spinners shown appropriately
- [ ] Skeleton screens or placeholders
- [ ] No blank screens
- [ ] Loading text descriptive
- [ ] Can't interact during loading
- [ ] Timeout handling

**Mobile-Specific Checks**:
- [ ] Loading indicators centered
- [ ] Size appropriate for mobile
- [ ] Not too much movement/animation

---

## Test Case 5.9: Error States (Mobile)

**Steps**:
1. Trigger various errors (invalid input, network issues)
2. Observe error messages
3. Test recovery

**Expected Results**:
- [ ] Error messages displayed clearly
- [ ] Message text understandable
- [ ] Actionable feedback provided
- [ ] Can dismiss or retry
- [ ] Errors don't crash app

**Mobile-Specific Checks**:
- [ ] Error messages fit on screen
- [ ] Alert/snackbar positioned well
- [ ] Easy to dismiss

---

## Test Case 5.10: Form Input Behavior (Mobile)

**Steps**:
1. Test all forms in app
2. Focus on different input types
3. Test keyboard behavior

**Expected Results**:
- [ ] Correct keyboard type for input:
  - Email keyboard for email
  - Number keyboard for numbers
  - Text keyboard for text
- [ ] Keyboard doesn't obscure inputs
- [ ] Can scroll to see hidden inputs
- [ ] Auto-capitalize appropriate
- [ ] Autocomplete works where expected

**Mobile-Specific Checks**:
- [ ] Input field height adequate
- [ ] Padding comfortable for touch
- [ ] Next/Done buttons work
- [ ] Can tab between fields

---

## Test Case 5.11: Modal/Dialog Behavior (Mobile)

**Steps**:
1. Open various modals
2. Test interactions
3. Test dismissal

**Expected Results**:
- [ ] Modals sized for mobile screen
- [ ] Content scrollable if needed
- [ ] Can close via:
  - Close button
  - Backdrop tap
  - Cancel button
- [ ] Actions clearly visible
- [ ] No content cutoff

**Mobile-Specific Checks**:
- [ ] Modal doesn't overflow viewport
- [ ] Buttons reachable without scroll
- [ ] Backdrop visible

---

## Test Case 5.12: Performance (Mobile)

**Steps**:
1. Navigate through app quickly
2. Add/delete multiple items
3. Monitor responsiveness

**Expected Results**:
- [ ] Smooth 60fps animations
- [ ] No noticeable lag
- [ ] Quick page transitions
- [ ] Images load progressively
- [ ] No memory issues

**Mobile-Specific Checks**:
- [ ] No jank on scroll
- [ ] Touch response immediate
- [ ] Battery usage reasonable

---

## Test Case 5.13: Typography & Readability (Mobile)

**Steps**:
1. Review all pages
2. Check text sizing
3. Test without zooming

**Expected Results**:
- [ ] All text readable without zoom
- [ ] Minimum 16px for body text
- [ ] Good contrast ratios
- [ ] Line height appropriate
- [ ] Line length comfortable (45-75 chars)

**Mobile-Specific Checks**:
- [ ] No tiny text
- [ ] Headers properly sized
- [ ] Long text wraps correctly

---

## Issues Found

| Issue # | Description | Severity | Screenshot |
|---------|-------------|----------|------------|
| | | | |

---

## Recommendations

-
-
