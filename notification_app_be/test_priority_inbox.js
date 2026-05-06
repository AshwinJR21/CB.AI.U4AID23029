import PriorityInbox from './priority_inbox.js';
import fs from 'fs';

async function run() {
    const inbox = new PriorityInbox(10);
    console.log("Fetching notifications from API...");
    await inbox.fetchAndProcessNotifications();
    const top = inbox.getTopNotifications();
    
    fs.writeFileSync('test_output.json', JSON.stringify({
        status: "success",
        topNotifications: top
    }, null, 2));
    
    console.log("Done.");
}

run();
