# Testing Guide

Complete testing checklist for the Focus Mode Chrome Extension.

## Pre-Testing Setup

1. ✅ Backend server running on http://localhost:5000
2. ✅ Extension loaded in Chrome
3. ✅ Extension pinned to toolbar
4. ✅ User ID 1 exists in database

## Test Suite

### 1. Extension Installation

**Test: Extension loads without errors**
- [ ] Go to `chrome://extensions/`
- [ ] Extension appears in list
- [ ] No error messages shown
- [ ] Extension icon visible in toolbar

**Expected:** Green checkmark, no errors

---

### 2. Popup UI

**Test: Popup opens and displays correctly**
- [ ] Click extension icon
- [ ] Popup window opens
- [ ] Shows "Study Planner AI" header
- [ ] Shows status indicator
- [ ] Shows "Open Dashboard" button
- [ ] Shows "Refresh Status" button

**Expected:** Clean UI with gradient background

**Test: Popup shows inactive state**
- [ ] No active focus session
- [ ] Status shows "Focus Mode Inactive"
- [ ] Status dot is gray
- [ ] No time remaining shown
- [ ] Info text: "Start a focus session..."

**Expected:** Inactive state displayed correctly

---

### 3. Focus Session Sync

**Test: Extension detects active session**
1. [ ] Go to dashboard (http://localhost:5000)
2. [ ] Start a 30-minute focus session
3. [ ] Wait 10 seconds (sync interval)
4. [ ] Click extension icon
5. [ ] Status should show "Focus Mode Active"
6. [ ] Status dot should be green and pulsing
7. [ ] Time remaining should be displayed
8. [ ] Badge should show "ON"

**Expected:** Extension syncs and shows active state

**Test: Manual refresh works**
1. [ ] Start focus session
2. [ ] Immediately click extension icon
3. [ ] Click "Refresh Status" button
4. [ ] Status updates without waiting

**Expected:** Immediate sync on manual refresh

---

### 4. Website Blocking

**Test: Social media sites blocked**

With focus mode active, try visiting:
- [ ] https://instagram.com → Blocked
- [ ] https://facebook.com → Blocked
- [ ] https://twitter.com → Blocked
- [ ] https://tiktok.com → Blocked

**Expected:** All redirect to blocked page

**Test: Entertainment sites blocked**
- [ ] https://netflix.com → Blocked
- [ ] https://reddit.com → Blocked
- [ ] https://twitch.tv → Blocked

**Expected:** All redirect to blocked page

**Test: Gaming sites blocked**
- [ ] https://store.steampowered.com → Blocked
- [ ] https://poki.com → Blocked

**Expected:** All redirect to blocked page

**Test: Productive sites allowed**
- [ ] https://google.com → Allowed
- [ ] https://github.com → Allowed
- [ ] https://stackoverflow.com → Allowed

**Expected:** All sites work normally

---

### 5. Blocked Page UI

**Test: Blocked page displays correctly**
1. [ ] Visit blocked site during focus mode
2. [ ] Redirected to blocked page
3. [ ] Shows "Focus Mode is Active" title
4. [ ] Shows motivational quote
5. [ ] Shows time remaining
6. [ ] Shows blocked URL
7. [ ] Shows "Return to Study Dashboard" button

**Expected:** Premium dark theme with animations

**Test: Blocked page timer updates**
1. [ ] On blocked page
2. [ ] Watch timer for 10 seconds
3. [ ] Timer counts down correctly

**Expected:** Real-time countdown

**Test: Return to dashboard button works**
1. [ ] On blocked page
2. [ ] Click "Return to Study Dashboard"
3. [ ] Redirects to http://localhost:5000

**Expected:** Successful redirect

---

### 6. YouTube Smart Filtering

**Test: YouTube homepage blocked**
1. [ ] Focus mode active
2. [ ] Visit https://youtube.com
3. [ ] Should be blocked

**Expected:** Redirected to blocked page

**Test: YouTube Shorts blocked**
1. [ ] Focus mode active
2. [ ] Visit https://youtube.com/shorts/[any-video]
3. [ ] Should be blocked

**Expected:** Redirected to blocked page

**Test: YouTube Trending blocked**
1. [ ] Focus mode active
2. [ ] Visit https://youtube.com/feed/trending
3. [ ] Should be blocked

**Expected:** Redirected to blocked page

**Test: Educational YouTube video allowed**
1. [ ] Focus mode active
2. [ ] Visit educational video (e.g., Khan Academy, MIT OpenCourseWare)
3. [ ] Video should load and play

**Expected:** Video plays normally

**Test: Non-educational YouTube video blocked**
1. [ ] Focus mode active
2. [ ] Visit entertainment video (music video, vlog, etc.)
3. [ ] Should be blocked with reason

**Expected:** Redirected to blocked page with reason

**Test: YouTube verification caching**
1. [ ] Visit educational video → Allowed
2. [ ] Visit same video again
3. [ ] Should load instantly (from cache)

**Expected:** No API call, instant load

---

### 7. Focus Session End

**Test: Extension deactivates when session ends**
1. [ ] Start 1-minute focus session
2. [ ] Wait for session to complete
3. [ ] Click extension icon
4. [ ] Status should show "Focus Mode Inactive"
5. [ ] Badge should be empty

**Expected:** Automatic deactivation

**Test: Blocked sites accessible after session**
1. [ ] Session ended
2. [ ] Visit previously blocked site
3. [ ] Site should load normally

**Expected:** No blocking when inactive

---

### 8. Content Script (YouTube)

**Test: Focus overlay on YouTube**
1. [ ] Focus mode active
2. [ ] Visit allowed YouTube video
3. [ ] Purple banner at top: "🎯 Focus Mode Active"

**Expected:** Overlay visible

**Test: Recommendations hidden**
1. [ ] Focus mode active
2. [ ] On YouTube video page
3. [ ] Sidebar recommendations should be hidden

**Expected:** Clean video page

---

### 9. Error Handling

**Test: Backend offline**
1. [ ] Stop backend server
2. [ ] Click extension icon
3. [ ] Should show inactive state (graceful degradation)

**Expected:** No crashes, shows inactive

**Test: Invalid video ID**
1. [ ] Focus mode active
2. [ ] Visit YouTube with invalid video ID
3. [ ] Should handle gracefully

**Expected:** Blocked or error message

**Test: Network timeout**
1. [ ] Simulate slow network
2. [ ] Extension should still function
3. [ ] May show stale data

**Expected:** No crashes

---

### 10. Performance

**Test: Extension doesn't slow down browser**
1. [ ] Open 10+ tabs
2. [ ] Extension should not cause lag
3. [ ] Check CPU usage in Task Manager

**Expected:** <5% CPU usage

**Test: Memory usage reasonable**
1. [ ] Check `chrome://extensions/`
2. [ ] Click "Details" on extension
3. [ ] Check memory usage

**Expected:** <50MB memory

---

### 11. Edge Cases

**Test: Multiple tabs**
1. [ ] Open Instagram in 3 tabs
2. [ ] All should be blocked

**Expected:** Consistent blocking

**Test: Incognito mode**
1. [ ] Enable extension in incognito
2. [ ] Test blocking in incognito window

**Expected:** Works in incognito

**Test: Session during browser restart**
1. [ ] Start focus session
2. [ ] Close and reopen Chrome
3. [ ] Extension should re-sync

**Expected:** Resumes blocking

---

## Automated Testing (Optional)

For CI/CD, consider:
- Puppeteer tests for extension
- API endpoint tests
- Integration tests

## Bug Reporting

If you find issues:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check extension service worker logs
4. Check network tab for failed requests
5. Document expected vs actual behavior

## Performance Benchmarks

Target metrics:
- Sync interval: 10 seconds
- API response time: <500ms
- Page redirect time: <100ms
- Extension load time: <1 second
- Memory usage: <50MB
- CPU usage: <5%

## Success Criteria

Extension is ready for production when:
- ✅ All tests pass
- ✅ No console errors
- ✅ Performance within targets
- ✅ Works in incognito mode
- ✅ Handles offline gracefully
- ✅ UI is polished
- ✅ Documentation complete
