import React, { useState, useEffect } from 'react';
import PriorityInbox from '../utils/PriorityInbox.js';
import Log from 'logging_middleware';

function PriorityNotifications() {
  const [topNotifications, setTopNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndBuildPriorityQueue();
    const interval = setInterval(fetchAndBuildPriorityQueue, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAndBuildPriorityQueue = async () => {
    Log("frontend", "info", "api", "Fetching notifications to evaluate for Priority Inbox");
    
    try {
      const response = await fetch("/evaluation-service/notifications", {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwiZXhwIjoxNzc4MDY1Nzg5LCJpYXQiOjE3NzgwNjQ4ODksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI4N2E4N2I0NC0zMjcwLTQ4Y2MtYTlkMS1lN2Q3NGU2MDE3OGUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyIGFzaHdpbiBqYXlhY2hhbmRyYW4iLCJzdWIiOiI0Yzg3OGMwNS04YzRiLTQyZjYtYTk2Mi03YWJlYzI5YzQ0MzMifSwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwibmFtZSI6InIgYXNod2luIGpheWFjaGFuZHJhbiIsInJvbGxObyI6ImNiLmFpLnU0YWlkMjMwMjkiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiI0Yzg3OGMwNS04YzRiLTQyZjYtYTk2Mi03YWJlYzI5YzQ0MzMiLCJjbGllbnRTZWNyZXQiOiJlZ1VLTmZVUGhOdXRVWmJSIn0.UId74uf9AeBgw6SyWE4iSY_4d6xHBEaiY9A8ywdzbZc"
        }
      });
      if (!response.ok) {
        Log("frontend", "error", "api", "Failed to fetch for Priority Inbox");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const rawNotifications = Array.isArray(data) ? data : (data.notifications || []);
      const fetchedNotifications = rawNotifications.map(n => ({
        id: n.id || n.ID,
        type: n.type || n.Type,
        message: n.message || n.Message,
        timestamp: n.timestamp || n.Timestamp
      }));
      
      const inbox = new PriorityInbox(10);
      fetchedNotifications.forEach(notif => inbox.push(notif));
      
      const top10 = inbox.getTopNotifications();
      setTopNotifications(top10);
      Log("frontend", "info", "state", `Updated Priority Inbox with ${top10.length} items`);
    } catch (error) {
      Log("frontend", "error", "api", "Exception caught while updating Priority Inbox");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Priority Inbox</h1>
        <p>Top 10 most critical notifications based on weight and recency.</p>
      </div>

      {loading && topNotifications.length === 0 ? (
        <div className="loader">Evaluating Priorities...</div>
      ) : (
        <div className="notification-grid priority-grid">
          {topNotifications.length === 0 ? (
            <div className="empty-state">No priority notifications right now.</div>
          ) : (
            topNotifications.map((notif, index) => (
              <div key={notif.id} className={`notification-card priority-card ${notif.type?.toLowerCase()}`}>
                <div className="card-header">
                  <div className="rank-badge">#{index + 1}</div>
                  <div className="card-badge">{notif.type}</div>
                </div>
                <p className="card-message">{notif.message}</p>
                <span className="card-timestamp">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PriorityNotifications;
