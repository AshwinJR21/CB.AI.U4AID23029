import React, { useState, useEffect } from 'react';
import Log from 'logging_middleware';

function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filterType, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    Log("frontend", "info", "api", `Fetching all notifications. Page: ${page}, Type: ${filterType || 'all'}`);
    
    try {
      const url = new URL("/evaluation-service/notifications", window.location.origin);
      url.searchParams.append("limit", "20");
      url.searchParams.append("page", page);
      if (filterType) {
        url.searchParams.append("notification_type", filterType);
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwiZXhwIjoxNzc4MDY1Nzg5LCJpYXQiOjE3NzgwNjQ4ODksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI4N2E4N2I0NC0zMjcwLTQ4Y2MtYTlkMS1lN2Q3NGU2MDE3OGUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyIGFzaHdpbiBqYXlhY2hhbmRyYW4iLCJzdWIiOiI0Yzg3OGMwNS04YzRiLTQyZjYtYTk2Mi03YWJlYzI5YzQ0MzMifSwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwibmFtZSI6InIgYXNod2luIGpheWFjaGFuZHJhbiIsInJvbGxObyI6ImNiLmFpLnU0YWlkMjMwMjkiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiI0Yzg3OGMwNS04YzRiLTQyZjYtYTk2Mi03YWJlYzI5YzQ0MzMiLCJjbGllbnRTZWNyZXQiOiJlZ1VLTmZVUGhOdXRVWmJSIn0.UId74uf9AeBgw6SyWE4iSY_4d6xHBEaiY9A8ywdzbZc"
        }
      });
      if (!response.ok) {
        Log("frontend", "error", "api", `API fetch failed with status ${response.status}`);
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
      setNotifications(fetchedNotifications);
      Log("frontend", "debug", "state", `Successfully fetched ${fetchedNotifications.length} notifications`);
    } catch (error) {
      Log("frontend", "error", "api", "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    Log("frontend", "info", "hook", `User changed filter to: ${value || 'all'}`);
    setFilterType(value);
    setPage(1); // Reset page on filter change
  };

  const handlePageChange = (direction) => {
    Log("frontend", "info", "hook", `User changing page ${direction}`);
    setPage(prev => direction === 'next' ? prev + 1 : Math.max(1, prev - 1));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Notifications</h1>
        <select value={filterType} onChange={handleFilterChange} className="filter-select">
          <option value="">All Types</option>
          <option value="placement">Placement</option>
          <option value="result">Result</option>
          <option value="event">Event</option>
        </select>
      </div>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="notification-grid">
          {notifications.length === 0 ? (
            <div className="empty-state">No notifications found.</div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className={`notification-card ${notif.type?.toLowerCase()}`}>
                <div className="card-badge">{notif.type}</div>
                <p className="card-message">{notif.message}</p>
                <span className="card-timestamp">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      <div className="pagination">
        <button onClick={() => handlePageChange('prev')} disabled={page === 1 || loading}>Previous</button>
        <span className="page-indicator">Page {page}</span>
        <button onClick={() => handlePageChange('next')} disabled={loading}>Next</button>
      </div>
    </div>
  );
}

export default AllNotifications;
