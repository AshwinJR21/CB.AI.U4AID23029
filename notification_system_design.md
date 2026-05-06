# Stage 1

## The problem
The campus notification platform receives a high volume of updates regarding placements, events, and results. Users often lose track of important notifications because they get buried in the feed.

## Proposed Solution
Implement a Priority Inbox that maintains and displays the top 10 most important unread notifications.
The priority logic is defined by:
1. **Weight**: Placement (Highest) > Result > Event (Lowest).
2. **Recency**: When weights are identical, the newer notification takes precedence (based on timestamp).

## Approach: Min-Heap (Priority Queue)
To efficiently maintain the "Top 10" notifications as a continuous stream of new notifications arrives, we will use a **Min-Heap** data structure constrained to a maximum size of `k = 10`.

### Why a Min-Heap?
- A Min-Heap allows us to track the *lowest priority* notification in our current top 10.
- The lowest priority item in the top 10 will always reside at the root of the Min-Heap.
- When a new notification arrives:
  1. If the heap currently has fewer than 10 items, we simply insert the new notification and restore the heap invariant.
  2. If the heap is full (10 items), we compare the new notification's priority with the root. 
  3. If the new notification has a **higher priority** than the root, we discard the root and insert the new notification.
  4. If the new notification has a **lower priority** than the root, it means it doesn't belong in the top 10, so we discard it immediately.

### Prioritization Logic
The comparison function dictates the heap's behavior:
- First, we map categories to numerical weights (e.g., Placement = 3, Result = 2, Event = 1).
- We compare the weights of two notifications.
- If the weights are equal, we compare their timestamps (newer is higher).

### Complexity
- **Time Complexity**: Inserting a new item takes `O(log k)` time. Insertion is as good as `O(1)` since k is constant. Extracting the top 10 and sorting them takes `O(k log k)`. which is also pretty much `O(1)` in this case making this highly scalable
- **Space Complexity**: `O(k)` where `k=10`. We only store at most 10 items in memory at any given time.
