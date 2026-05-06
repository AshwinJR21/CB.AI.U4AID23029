import React, { useState, useEffect } from 'react';
import Log from 'logging_middleware';

const ITEMS_PER_PAGE = 20;

function AllNotifications() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    Log("frontend", "info", "api", "Fetching all notifications");
    
    try {
      const response = await fetch("/evaluation-service/notifications", {
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
      setAllNotifications(fetchedNotifications);
      Log("frontend", "debug", "state", `Successfully fetched ${fetchedNotifications.length} notifications`);
    } catch (error) {
      Log("frontend", "error", "api", "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filtered = filterType
    ? allNotifications.filter(n => n.type?.toLowerCase() === filterType)
    : allNotifications;

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    Log("frontend", "info", "hook", `User changed filter to: ${value || 'all'}`);
    setFilterType(value);
    setPage(1);
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
          {paginated.length === 0 ? (
            <div className="empty-state">No notifications found.</div>
          ) : (
            paginated.map((notif) => (
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
        <span className="page-indicator">Page {page} of {totalPages}</span>
        <button onClick={() => handlePageChange('next')} disabled={page >= totalPages || loading}>Next</button>
      </div>
    </div>
  );
}

export default AllNotifications;
