# Mobile Test Scripts for MyMealPlanner

This directory contains manual test scripts focused on mobile usability and functionality testing.

## Test Environment Setup

### Required Devices/Tools
- **Mobile Device**: iOS or Android smartphone
- **Desktop Browser**: Chrome/Firefox with responsive design mode
- **Screen Sizes to Test**:
  - Mobile: 375x667 (iPhone SE)
  - Mobile: 390x844 (iPhone 12/13)
  - Tablet: 768x1024 (iPad)
  - Desktop: 1920x1080

### Test Data Requirements
- Test user account with authentication
- At least 5 meals in the database with:
  - Images
  - Ratings
  - Tags
  - Recipe URLs
  - Versions (at least 2 meals)
  - Freezer portions (at least 2 meals)
- Sample frequent shopping items

## Running the Tests

1. Open the application in your test environment
2. Follow each test script in order
3. Mark results as PASS/FAIL
4. Document any issues found with screenshots
5. Note recommendations for improvements

## Test Scripts

- `01-authentication.md` - Login/Signup flows
- `02-meal-management.md` - Creating and managing meals
- `03-meal-planner.md` - Weekly meal planning
- `04-shopping-list.md` - Shopping list functionality
- `05-navigation.md` - Mobile navigation and UX
- `06-sharing.md` - Sharing functionality
- `07-offline.md` - PWA and offline functionality

## Reporting Issues

When documenting issues, include:
- Test script reference (e.g., "03-meal-planner.md - Test Case 3")
- Device/Browser information
- Steps to reproduce
- Expected vs actual behavior
- Screenshot if applicable
- Severity: Critical / High / Medium / Low

## Test Results Template

```
Test Date: YYYY-MM-DD
Tester: [Name]
Device: [Device/Browser]
Screen Size: [Dimensions]

PASS: X/Y tests passed
FAIL: Y/Y tests failed

Issues Found:
1. [Brief description] - Severity: [Level]
2. ...
```
