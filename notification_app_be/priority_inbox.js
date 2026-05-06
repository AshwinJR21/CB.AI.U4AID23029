const Log = require('../logging_middleware/index.js');

class PriorityInbox {
    constructor(maxSize = 10) {
        this.heap = [];
        this.maxSize = maxSize;
        Log("backend", "info", "component", "Initialized priority box min heap with max size " + maxSize);
    }

    getWeight(notification_type) {
        if (notification_type === 'Placement') return 3; //weight 3 for notif type placement
        if (notification_type === 'Result') return 2; //weight 2 for notif type result
        if (notification_type === 'Event') return 1; //weight 1 for notif type event
        return 0; //no weight otherwise
    }                                                   //This function assigns weight as per notificaiton type.

    compare(a, b) {
        const weightA = this.getWeight(a.type);
        const weightB = this.getWeight(b.type);
        
        if (weightA !== weightB) {
            return weightA - weightB; //this way, if the weight of A is greater, we return a positive number. if not, returns a negative number. 
        }
        
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return timeA - timeB; //here, recency is calculated only if weights of A and B are equal.
    }                                                 //This function compares priority of two notifs. 

    push(notification) {
        Log("backend", "debug", "component", "Evaluating new notification for priority inbox");
        
        if (this.heap.length < this.maxSize) {
            this.heap.push(notification);
            this.bubbleUp(this.heap.length - 1);
            Log("backend", "debug", "component", "Added notification to priority inbox (heap not full)");
        } else {

            if (this.compare(notification, this.heap[0]) > 0) {
                Log("backend", "info", "component", "Replacing lowest priority notification in the inbox");
                this.heap[0] = notification;
                this.bubbleDown(0);
            } else {
                Log("backend", "debug", "component", "Notification priority too low for inbox, ignoring");
            }
        }
    }                                               //This function inserts a new notification into the heap and does bubble up or down operations.

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[parentIndex], this.heap[index]) > 0) {
                this.swap(parentIndex, index);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    bubbleDown(index) {
        const length = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            // If left child has lower priority than current smallest, update smallest
            if (leftChildIndex < length && this.compare(this.heap[smallestIndex], this.heap[leftChildIndex]) > 0) {
                smallestIndex = leftChildIndex;
            }

            // If right child has lower priority than current smallest, update smallest
            if (rightChildIndex < length && this.compare(this.heap[smallestIndex], this.heap[rightChildIndex]) > 0) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex !== index) {
                this.swap(index, smallestIndex);
                index = smallestIndex;
            } else {
                break;
            }
        }
    }

    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    getTopNotifications() {
        Log("backend", "info", "component", "Retrieving top notifications for display");
        return [...this.heap].sort((a, b) => this.compare(b, a));
    }

    async fetchAndProcessNotifications() {
        Log("backend", "info", "api", "Fetching notifications from evaluation service API");
        try {
            const response = await fetch("http://20.207.122.201/evaluation-service/notifications");
            if (!response.ok) {
                Log("backend", "error", "api", "API fetch failed with unsuccessful status");
                return;
            }
            const data = await response.json();
            
            const notifications = Array.isArray(data) ? data : (data.notifications || []);
            
            Log("backend", "info", "api", "Successfully parsed notification payload");
            for (const notif of notifications) {
                this.push(notif);
            }
        } catch (error) {
            Log("backend", "error", "api", "Exception occurred while fetching notifications");
        }
    }
}

module.exports = PriorityInbox;
