# Test Script 06: PWA & Offline Functionality

**Focus**: Progressive Web App features and offline capabilities
**Estimated Time**: 15 minutes

## Pre-requisites
- Mobile device or desktop browser
- Ability to toggle network connectivity
- Service worker enabled

---

## Test Case 6.1: PWA Install Prompt (Mobile)

**Steps**:
1. Visit app on mobile browser
2. Wait for install prompt
3. Observe prompt behavior

**Expected Results**:
- [ ] Install prompt appears (if implemented)
- [ ] Prompt clearly explains PWA benefits
- [ ] Can install or dismiss
- [ ] Prompt can be triggered again later
- [ ] Prompt timing appropriate (not immediate)

**Mobile-Specific Checks**:
- [ ] Prompt positioned well on mobile
- [ ] Text readable
- [ ] Actions clear (Install/Cancel)
- [ ] Doesn't interrupt critical tasks

---

## Test Case 6.2: Add to Home Screen (Mobile)

**Steps**:
1. Open browser menu
2. Select "Add to Home Screen"
3. Confirm addition
4. Find app icon on home screen
5. Tap to launch

**Expected Results**:
- [ ] Option available in browser menu
- [ ] App name displayed correctly
- [ ] Icon displayed correctly (192x192 and 512x512)
- [ ] Icon appears on home screen
- [ ] Launches in standalone mode (no browser UI)
- [ ] Splash screen shows (if configured)
- [ ] App loads successfully

**Mobile-Specific Checks**:
- [ ] Icon crisp on device
- [ ] Name not truncated
- [ ] Splash screen appropriate
- [ ] Status bar color correct

---

## Test Case 6.3: Standalone Mode (PWA)

**Steps**:
1. Launch app from home screen
2. Navigate through pages
3. Observe UI differences

**Expected Results**:
- [ ] No browser address bar
- [ ] No browser navigation buttons
- [ ] Full-screen app experience
- [ ] Back button works within app
- [ ] Can't accidentally navigate away
- [ ] App feels native

**Mobile-Specific Checks**:
- [ ] Safe area respected (notch, etc.)
- [ ] Status bar integrated
- [ ] Gestures work properly

---

## Test Case 6.4: Service Worker Registration (Mobile)

**Steps**:
1. Open browser dev tools (if mobile browser supports)
2. Check service worker status
3. Verify registration

**Expected Results**:
- [ ] Service worker registered successfully
- [ ] sw.js file loads without errors
- [ ] Service worker activates
- [ ] Cache strategies working

**Mobile-Specific Checks**:
- [ ] Check via desktop debugging
- [ ] Verify in Application tab

---

## Test Case 6.5: Offline Access - Previously Visited Pages (Mobile)

**Steps**:
1. Visit all major pages while online
2. Enable airplane mode or disable network
3. Navigate to previously visited pages
4. Test functionality

**Expected Results**:
- [ ] Previously cached pages load offline
- [ ] Static assets (CSS, JS, images) load
- [ ] Layout remains intact
- [ ] No broken images (or fallbacks)
- [ ] Offline indicator shown (if implemented)

**Mobile-Specific Checks**:
- [ ] Mobile navigation works offline
- [ ] Images cached appropriately
- [ ] Page transitions smooth

---

## Test Case 6.6: Offline Data Access (Mobile)

**Steps**:
1. Load data while online (meals, lists, etc.)
2. Go offline
3. Try to access data

**Expected Results**:
- [ ] Cached data accessible offline
- [ ] Meals list shows cached meals
- [ ] Shopping list shows cached items
- [ ] Meal planner shows planned meals
- [ ] Data read-only or appropriately limited
- [ ] Clear offline messaging

**Mobile-Specific Checks**:
- [ ] IndexedDB/localStorage working
- [ ] Data persists across sessions
- [ ] No data loss

---

## Test Case 6.7: Offline Write Operations (Mobile)

**Steps**:
1. Go offline
2. Try to add/edit/delete items
3. Observe behavior

**Expected Results**:
- [ ] Write operations blocked OR
- [ ] Queued for sync when online OR
- [ ] Saved locally temporarily
- [ ] Clear messaging about offline state
- [ ] No data corruption
- [ ] User aware of limitations

**Mobile-Specific Checks**:
- [ ] Error messages clear
- [ ] Pending changes indicated
- [ ] Queue visible if implemented

---

## Test Case 6.8: Return to Online (Mobile)

**Steps**:
1. Perform offline actions (if queued)
2. Re-enable network
3. Observe sync behavior

**Expected Results**:
- [ ] App detects online status
- [ ] Queued actions sync automatically
- [ ] Success/failure feedback
- [ ] Conflicts handled gracefully
- [ ] Online indicator updates
- [ ] Full functionality restored

**Mobile-Specific Checks**:
- [ ] Background sync works
- [ ] No excessive data usage
- [ ] Sync doesn't block UI

---

## Test Case 6.9: App Update Flow (Mobile)

**Steps**:
1. With app installed, deploy update to server
2. Launch installed app
3. Observe update behavior

**Expected Results**:
- [ ] New service worker detected
- [ ] Update prompt appears (if implemented)
- [ ] Can choose to update now or later
- [ ] Update applies smoothly
- [ ] No data loss during update
- [ ] New version active after refresh

**Mobile-Specific Checks**:
- [ ] Update prompt mobile-friendly
- [ ] Update doesn't crash app
- [ ] Can postpone update

---

## Test Case 6.10: Cache Management (Mobile)

**Steps**:
1. Use app extensively
2. Check cache size (via dev tools)
3. Test cache limits

**Expected Results**:
- [ ] Cache size reasonable
- [ ] Old caches cleaned up
- [ ] Cache versioning working
- [ ] No excessive storage use
- [ ] Quota not exceeded

**Mobile-Specific Checks**:
- [ ] Storage usage acceptable for mobile
- [ ] Doesn't fill device storage
- [ ] Cache pruning works

---

## Test Case 6.11: Push Notifications (if implemented)

**Steps**:
1. Grant notification permission
2. Test notification triggers
3. Tap notification

**Expected Results**:
- [ ] Permission requested appropriately
- [ ] Notifications received
- [ ] Content clear and useful
- [ ] Tapping opens correct page
- [ ] Can manage/disable notifications
- [ ] Doesn't spam user

**Mobile-Specific Checks**:
- [ ] Notifications native-looking
- [ ] Vibration/sound appropriate
- [ ] Badge updates

---

## Test Case 6.12: Background Sync (if implemented)

**Steps**:
1. Make changes while online
2. Go offline immediately
3. Wait for background sync
4. Re-enable network

**Expected Results**:
- [ ] Changes queued for sync
- [ ] Sync happens in background
- [ ] User notified of sync status
- [ ] No data loss
- [ ] Conflicts resolved

**Mobile-Specific Checks**:
- [ ] Battery efficient
- [ ] Works when app closed
- [ ] Sync reliable

---

## Test Case 6.13: Manifest Configuration (Mobile)

**Steps**:
1. Inspect manifest.json
2. Verify all properties
3. Test manifest features

**Expected Results**:
- [ ] Name and short_name set
- [ ] Icons array complete (multiple sizes)
- [ ] Start URL correct
- [ ] Display mode: standalone
- [ ] Theme color set
- [ ] Background color set
- [ ] Orientation preference set (if any)

**Mobile-Specific Checks**:
- [ ] Icons sharp on all devices
- [ ] Theme color matches design
- [ ] Splash screen looks good

---

## Issues Found

| Issue # | Description | Severity | Screenshot |
|---------|-------------|----------|------------|
| | | | |

---

## Recommendations

-
-
