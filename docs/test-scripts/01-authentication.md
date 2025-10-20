# Test Script 01: Authentication

**Focus**: Mobile authentication flows
**Estimated Time**: 10 minutes

## Pre-requisites
- Clear browser cache/app data
- Test email account available

---

## Test Case 1.1: Landing Page Display

**Steps**:
1. Open application URL on mobile device
2. Observe landing page layout

**Expected Results**:
- [ ] Landing page displays properly on mobile
- [ ] Hero section is visible and readable
- [ ] Sign Up/Login buttons are clearly visible
- [ ] All text is legible without zooming
- [ ] No horizontal scrolling required

**Mobile-Specific Checks**:
- [ ] Touch targets are at least 44x44 pixels
- [ ] Buttons are thumb-friendly positioned
- [ ] Images/graphics load properly

---

## Test Case 1.2: Sign Up Flow

**Steps**:
1. Tap "Sign Up" button
2. Enter test email address
3. Enter display name
4. Enter password (min 6 characters)
5. Tap "Sign Up" button

**Expected Results**:
- [ ] Modal/form displays properly on mobile screen
- [ ] Input fields are appropriately sized
- [ ] Keyboard appears when tapping input fields
- [ ] Keyboard doesn't obscure important UI elements
- [ ] Error messages display clearly if validation fails
- [ ] Success confirmation shown after signup
- [ ] Email confirmation sent (check configured URL)

**Mobile-Specific Checks**:
- [ ] Can easily switch between input fields
- [ ] Password visibility toggle works
- [ ] No autofill issues
- [ ] Can close modal easily

---

## Test Case 1.3: Login Flow

**Steps**:
1. Log out if logged in
2. Tap "Login" button
3. Enter credentials
4. Tap "Login" button

**Expected Results**:
- [ ] Login modal displays properly
- [ ] Can enter credentials easily
- [ ] Login completes successfully
- [ ] Redirected to home page
- [ ] No loading screen stuck issues

**Mobile-Specific Checks**:
- [ ] Email keyboard type appears
- [ ] Remember me/autofill works
- [ ] Error messages are readable

---

## Test Case 1.4: Logout Flow

**Steps**:
1. Navigate to User Profile
2. Tap "Logout" button
3. Confirm logout

**Expected Results**:
- [ ] Logout button is easily accessible
- [ ] Confirmation prompt appears
- [ ] Successfully logged out
- [ ] Redirected to landing page
- [ ] Session cleared properly

---

## Test Case 1.5: Email Confirmation URL

**Steps**:
1. Sign up with new account
2. Check confirmation email on mobile device
3. Tap confirmation link

**Expected Results**:
- [ ] Email received with correct sender
- [ ] Confirmation link uses http://mydinnerplanner.xyz/
- [ ] Link opens correctly on mobile browser
- [ ] Account confirmed successfully
- [ ] Can login after confirmation

---

## Issues Found

| Issue # | Description | Severity | Screenshot |
|---------|-------------|----------|------------|
| | | | |

---

## Recommendations

-
-
