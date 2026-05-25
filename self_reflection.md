# Self-Reflection: Campus Notification Priority Inbox

## 1. Understanding the Test Question

### Problem Statement
The campus notification platform receives a high volume of updates (placements, events, results). Users lose track of important notifications because they get buried in the feed.

### What Was Asked
Build a **Priority Inbox** system that:
1. Continuously ingests a stream of notifications from a live API.
2. Maintains and displays the **Top 10 most important unread notifications** at all times.
3. Applies a specific **priority logic**:
   - **Weight**: `Placement (3) > Result (2) > Event (1)`
   - **Recency tie-breaker**: When two notifications have the same weight, the newer one wins.
4. Uses a **Min-Heap (Priority Queue)** data structure capped at `k = 10` as the required approach.
5. Integrates a **logging middleware** that sends structured logs to an external evaluation service API — no `console.log` or language-native loggers allowed.
6. Provides a **React frontend** to display the priority inbox and all notifications.

---

## 2. What Was Done Correctly ✅

### 2.1 Core Data Structure — Min-Heap is Correctly Implemented

The `PriorityInbox` class in `notification_app_be/priority_inbox.js` (and mirrored in `notification_app_fe/src/utils/PriorityInbox.js`) implements a **from-scratch binary min-heap**, which is the right tool for this problem.

**Correct aspects:**

- **`getWeight()`** correctly maps notification types to numerical weights (Placement=3, Result=2, Event=1, unknown=0). Case-insensitive comparison (`toLowerCase()`) handles API inconsistencies gracefully.

- **`compare(a, b)`** correctly implements the two-level priority: weight first, then timestamp as a tie-breaker. Returning `weightA - weightB` correctly makes lower-weight items "smaller" in the min-heap, so the heap root always holds the lowest-priority item among the top 10 — which is exactly what you need for efficient eviction.

- **`push()` logic** is correct:
  - If the heap has fewer than 10 items → insert and `bubbleUp`. ✅
  - If the heap is full → compare the new item against the root (the current weakest item). ✅
  - If the new item is higher priority than the root → replace root and `bubbleDown`. ✅
  - Otherwise → silently discard. ✅

- **`bubbleUp()`** correctly walks up the tree, swapping a node with its parent while the parent has a *higher* compare value (i.e., is "larger" / lower priority in min-heap terms). Loop terminates correctly at `index === 0`.

- **`bubbleDown()`** correctly walks down, finding the smallest-priority child and swapping if needed. The `smallestIndex` pattern correctly handles both the left-only and both-children cases.

- **`getTopNotifications()`** correctly returns a sorted *copy* of the heap (`[...this.heap].sort(...)`) in descending priority order for display, without mutating the heap.

- **Complexity is correct** as stated in the design doc: `O(log k)` per insertion, `O(k log k)` for extraction — both effectively `O(1)` since `k = 10` is a constant.

---

### 2.2 API Integration is Correct

- The backend (`fetchAndProcessNotifications`) and frontend both correctly fetch from the evaluation service and normalize the payload, handling both `camelCase` and `PascalCase` field names (`n.id || n.ID`, etc.) — a real-world robustness concern.
- The backend uses the **absolute URL** with the full hostname (`http://20.207.122.201/...`), while the frontend correctly uses the **relative path** (`/evaluation-service/notifications`) and relies on Vite's dev proxy to forward requests. This separation is architecturally correct.

---

### 2.3 Logging Middleware is Correctly Used

- A dedicated `logging_middleware` package was built and published as a local npm package (`"logging_middleware": "file:../logging_middleware"`).
- The middleware's signature `Log(stack, level, package, message)` is used consistently across all files with appropriate context values (`"backend"` / `"frontend"`, `"info"` / `"debug"` / `"error"`, component name, descriptive message).
- Logs are placed at all meaningful lifecycle points: initialization, push decisions, API calls, state changes, navigation events, and errors.
- The constraint of **no `console.log`** is fully respected throughout the codebase.

---

### 2.4 Frontend Architecture is Sound

- Two dedicated pages: `AllNotifications.jsx` (all notifications with client-side filter + pagination) and `PriorityNotifications.jsx` (runs the priority heap client-side on fetched data).
- The `PriorityInbox` class is correctly shared as a utility (`src/utils/PriorityInbox.js`) and reused in the frontend page component.
- **Auto-refresh** is implemented correctly in `PriorityNotifications.jsx` using `setInterval` with a `clearInterval` cleanup in the `useEffect` return — no memory leaks.
- **Loading states** are handled with a `loading` flag and appropriate UI feedback.
- Client-side filter and pagination in `AllNotifications.jsx` work correctly and reset `page` to 1 when filter changes.
- The **Vite dev proxy** in `vite.config.js` is correctly configured to forward `/evaluation-service` requests to the target host, avoiding CORS issues in development.

---

### 2.5 Design Document is Well-Written

`notification_system_design.md` clearly explains the problem, the chosen approach, the reasoning for a Min-Heap, the prioritization logic, and the time/space complexity. This demonstrates a solid understanding of the algorithmic rationale.

---

## 3. What Was Done Incorrectly / Could Be Improved ⚠️

### 3.1 The Backend Logging Middleware Uses a Relative URL (Bug)

**File:** `logging_middleware/index.mjs`

```js
// index.mjs (used by backend)
await fetch("/evaluation-service/logs", { ... });
```

**Problem:** A **relative URL** like `/evaluation-service/logs` only works in a browser context where the base URL is known. In a **Node.js backend** (`priority_inbox.js` is run directly with Node), `fetch` with a relative URL will throw because Node has no concept of a base URL — it needs `http://20.207.122.201/evaluation-service/logs`.

The CJS version (`index.js`) correctly uses the absolute URL `http://20.207.122.201/evaluation-service/logs`. However, `priority_inbox.js` imports from `../logging_middleware/index.mjs` (the ESM version with the broken relative URL). This means **backend logs silently fail**, and since errors are swallowed in the `catch` block, this is invisible at runtime.

**Fix:** `index.mjs` should use the absolute URL, just like `index.js` does.

```js
// Corrected index.mjs
await fetch("http://20.207.122.201/evaluation-service/logs", { ... });
```

---

### 3.2 The `index.mjs` Logging Fetch Has No Error Handling for Unhandled Promise Rejection

**File:** `logging_middleware/index.js`

```js
await fetch("http://20.207.122.201/evaluation-service/logs", { ... });
// No try/catch — unhandled rejection if network fails
```

`index.js` (the CJS version) does **not** wrap the `fetch` in a `try/catch`. If the network call fails, it results in an **unhandled promise rejection** that can crash or warn in Node.js. The `index.mjs` version does have a `catch` block (which silently swallows errors), but since the backend uses `index.mjs` with a broken URL anyway (see 3.1), neither version logs correctly on the backend.

---

### 3.3 The `App.css` Contains Leftover Vite Boilerplate

**File:** `notification_app_fe/src/App.css`

The entire content of `App.css` is the **default Vite scaffold CSS** (`.hero`, `.ticks`, `#center`, `#next-steps`, etc.) — none of which is used anywhere in the actual application. This file is dead weight. `index.css` contains all the real, project-specific styles.

**Impact:** Minimal at runtime (it is not imported in `App.jsx`), but it is a cleanliness/hygiene issue indicating the project scaffolding was not cleaned up.

---

### 3.4 The `<title>` in `index.html` is Still the Default Vite Placeholder

**File:** `notification_app_fe/index.html`

```html
<title>notification_app_fe</title>
```

This should be a meaningful, user-facing title like **"CampusNotif — Priority Inbox"** for a finished product. This is a minor but noticeable omission in polish.

---

### 3.5 No Deduplication in the Priority Inbox

The `push()` method has no check for duplicate notification IDs. If the API returns the same notification twice across refreshes (e.g., the 30-second auto-refresh in `PriorityNotifications.jsx`), a duplicate could occupy a slot in the top 10.

**In the backend**, this is not a concern because `fetchAndProcessNotifications` is called once on a fresh `PriorityInbox` instance. **In the frontend**, a new `PriorityInbox` is also instantiated fresh on every refresh cycle (inside `fetchAndBuildPriorityQueue`), so duplicates from the API payload itself could still land in the heap if the API returns duplicate IDs.

**Suggested fix:** Add an ID set to guard against duplicates.

```js
push(notification) {
    if (this.seen.has(notification.id)) return; // deduplicate
    this.seen.add(notification.id);
    // ... rest of push logic
}
```

---

### 3.6 The `compare` Function Returns `0` for Equal Priority — Edge Case

When two notifications have the same type **and** the same timestamp (unlikely but possible), `compare` returns `0`. This is handled gracefully by JavaScript's sort, but in `bubbleUp` and `bubbleDown`, the `> 0` condition means equal-priority items will not swap, which is correct. This is not a bug, just worth noting as a considered edge case.

---

### 3.7 JWT Token is Hardcoded in Multiple Files

The Bearer token is duplicated in:
- `logging_middleware/index.js`
- `logging_middleware/index.mjs`
- `notification_app_be/priority_inbox.js`
- `notification_app_fe/src/pages/AllNotifications.jsx`
- `notification_app_fe/src/pages/PriorityNotifications.jsx`

While this is likely acceptable for an evaluation/test context with a single token, it is an anti-pattern in production code. The token should be stored in a single environment variable and referenced across all files. This also creates a maintenance burden — if the token changes, it must be updated in 5 places.

---

## 4. Summary Table

| Aspect | Status | Notes |
|---|---|---|
| Min-Heap data structure | ✅ Correct | Properly implemented from scratch |
| `compare` function (weight + recency) | ✅ Correct | Two-level comparison is accurate |
| `push` / eviction logic | ✅ Correct | Root replacement + bubbleDown is right |
| `bubbleUp` / `bubbleDown` | ✅ Correct | Standard heap operations are correct |
| `getTopNotifications` (sorted copy) | ✅ Correct | Does not mutate the heap |
| API fetch + payload normalization | ✅ Correct | Handles casing variants gracefully |
| Logging middleware integration | ✅ Correct | Used consistently, no console.log |
| Frontend auto-refresh + cleanup | ✅ Correct | No memory leak |
| Vite proxy configuration | ✅ Correct | Correctly avoids CORS issues |
| Backend log URL in `index.mjs` | ❌ Bug | Relative URL fails in Node.js |
| `index.js` missing try/catch | ⚠️ Risk | Unhandled promise rejection possible |
| Dead `App.css` boilerplate | ⚠️ Minor | Leftover Vite scaffold code |
| `<title>` tag placeholder | ⚠️ Minor | Not updated from Vite default |
| No deduplication in heap | ⚠️ Missing | Duplicate IDs could enter the heap |
| Hardcoded JWT in 5 files | ⚠️ Practice | Should be a single env variable |

---

## 5. Overall Assessment

The **core algorithmic solution is correct and well-reasoned**. The Min-Heap is implemented from scratch, the priority comparison function accurately encodes the problem's rules, and the heap's eviction logic is sound. The backend and frontend are cleanly separated with appropriate responsibilities, and the logging middleware demonstrates understanding of the no-`console.log` constraint.

The primary technical defect is the **relative URL in `index.mjs`**, which silently breaks all backend logging. The remaining issues are largely code hygiene and production-readiness concerns rather than correctness errors in the core algorithm.
