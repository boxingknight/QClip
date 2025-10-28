# 🔍 DEBUGGING CHECKLIST - Test With Me!

## ✅ Test #1: Multiple Videos on Timeline

**Action:** Import 2 videos
**Expected:** 
- Video 1 appears at `0:00`
- Video 2 appears AFTER Video 1 (e.g., at `0:29`)
- Both videos visible side-by-side

**Console Check:**
Look for `ADD_CLIPS` logs showing different `startTime` values

---

## ✅ Test #2: Trim Handle Click

**Action:** Click on RIGHT edge of a clip (the white line)
**Expected Console Output:**
```
🎯 [TRIM START] { side: 'right', clipId: '...', currentTrimIn: 0, currentTrimOut: 29.134, ... }
```

**If you DON'T see this log:**
- The trim handle isn't clickable
- CSS z-index issue or handle is too small

---

## ✅ Test #3: Trim Drag

**Action:** Click RIGHT edge and drag LEFT
**Expected Console Output:**
```
🎯 [TRIM START] { side: 'right', ... mouseX: 500 }
[TRIM] Right trim: { deltaTime: -2.5, dragStartTrimOut: 29.134, newTrimOut: 26.634, ... }
[TRIM_CLIP REDUCER] { newTrimIn: 0, newTrimOut: 26.634, newDuration: 26.634 }
[CLIP RENDER] { clipId: '...', duration: 26.634, width: '...' }
```

**Key Values to Check:**
- `deltaTime` should be NEGATIVE when dragging left
- `newTrimOut` should be LESS than `dragStartTrimOut`
- `newDuration` should DECREASE
- `[CLIP RENDER]` should show NEW duration

---

## 🚨 Current Issues Based on Your Console:

From your screenshot, I see:
```
[TRIM] Right trim: {deltaTime: …, dragStartTrimOut: 29.134, newTrimOut: 29.134, …}
```

**Problem:** `newTrimOut` equals `dragStartTrimOut` (both `29.134`)
**Meaning:** Either:
1. `deltaTime` is `0` (you're not dragging far enough)
2. Mouse position isn't being tracked correctly
3. Trim handle isn't responding to drag

---

## 🧪 Quick Test Steps:

1. **Restart the app** (npm start should be running)
2. **Import ONE video**
3. **Open Developer Console** (View > Toggle Developer Tools)
4. **Hover over RIGHT edge of clip** - does it change cursor to `↔`?
5. **Click and hold RIGHT edge** - do you see `🎯 [TRIM START]`?
6. **Drag LEFT about 100px** - do you see multiple `[TRIM] Right trim:` logs?
7. **Check the `deltaTime` value** - is it negative and changing?

---

## 📊 Expected Behavior Timeline:

```
Initial State:
Timeline: [■■■■■■■■■■] 29.1s
          ^         ^
          0s        29.1s

After Trimming Right Edge Left:
Timeline: [■■■■■■] 20s
          ^      ^
          0s     20s (trimmed 9.1s off the end)
```

---

## 💡 Possible Solutions Based on Testing:

### If trim handles aren't clickable:
- CSS issue with `.clip-trim-handle` z-index
- Handle width too small (currently 8px)

### If `deltaTime` is always 0:
- `pixelsToTime` calculation issue
- `zoom` value incorrect

### If clip doesn't shrink visually:
- React not re-rendering (check `[CLIP RENDER]` logs)
- State update issue in reducer

---

**Let me know what you see in the console when you test!** 🎬

