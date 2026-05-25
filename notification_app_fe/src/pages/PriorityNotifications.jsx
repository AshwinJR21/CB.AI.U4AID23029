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
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwiZXhwIjoxNzc5NDI5NjQ3LCJpYXQiOjE3Nzk0Mjg3NDcsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI0YzY2ZTI0Yi1jYThhLTRkY2MtODRlMC02NTg0MGQzYTM4MTciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyIGFzaHdpbiBqYXlhY2hhbmRyYW4iLCJzdWIiOiI4MDMzZTBmYi1iNTA5LTQ3OTctODczYS04MjY3YWI1YzExYjQifSwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwibmFtZSI6InIgYXNod2luIGpheWFjaGFuZHJhbiIsInJvbGxObyI6ImNiLmFpLnU0YWlkMjMwMjkiLCJhY2Nlc3NDb2RlIjoiVll1UXpqIiwiY2xpZW50SUQiOiI4MDMzZTBmYi1iNTA5LTQ3OTctODczYS04MjY3YWI1YzExYjQiLCJjbGllbnRTZWNyZXQiOiJRQ3p3UlBzcHRDdlFkZ1VIIn0.myPlqYMxXqCuq4AsJaCRCdBZpQC15e8ZdU6Lhe7njK0"
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
