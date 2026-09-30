import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaveRequest.css';

export default function LeaveRequest() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [managerNotes, setManagerNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const getAuthData = () => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    return {
      token,
      user: storedUser ? JSON.parse(storedUser) : null
    };
  };

  const fetchManagerRequests = async () => {
    try {
      const { token, user } = getAuthData();

      if (!token || !user) {
        navigate('/login');
        return;
      }

      if (user.role !== 'manager') {
        navigate('/');
        return;
      }

      const response = await fetch(
        'http://localhost:5000/api/leaves/manager',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch leave requests.'
        );
      }

      setRequests(data.leaves || []);
    } catch (error) {
      console.error('Manager requests error:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerRequests();
  }, []);

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return (
      Math.floor(
        (end - start) / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (fullName = '') => {
    return fullName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  };

  const formatDateRange = (request) => {
    const start = formatDate(request.start_date);
    const end = formatDate(request.end_date);
    const days = calculateDays(
      request.start_date,
      request.end_date
    );

    return `${start} – ${end} (${days}d)`;
  };

  const filteredRequests = requests.filter((request) => {
    const employeeName =
      request.employee_name?.toLowerCase() || '';

    const matchesQuery = employeeName.includes(
      searchQuery.toLowerCase().trim()
    );

    const matchesFilter =
      filterType === 'all' ||
      request.leave_type.toLowerCase() ===
        filterType.toLowerCase();

    return matchesQuery && matchesFilter;
  });

  const handleAction = async (id, status) => {
    if (!activeRequest) return;

    setIsUpdating(true);

    try {
      const { token } = getAuthData();

      const response = await fetch(
        `http://localhost:5000/api/leaves/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status,
            managerComment: managerNotes.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update leave status.'
        );
      }

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id
            ? {
                ...request,
                status,
                manager_comment: managerNotes.trim()
              }
            : request
        )
      );

      setActiveRequest(null);
      setManagerNotes('');
    } catch (error) {
      console.error('Leave status update error:', error);
      alert(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="leave-request-layout">
        <main className="main-content">
          <div className="content-container">
            <h2>Loading leave requests...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="leave-request-layout">
        <main className="main-content">
          <div className="content-container">
            <h2>Something went wrong</h2>
            <p>{errorMessage}</p>

            <button
              className="btn-action-approve"
              type="button"
              onClick={() => {
                setErrorMessage('');
                setLoading(true);
                fetchManagerRequests();
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const pendingRequests = requests.filter(
    (request) => request.status === 'PENDING'
  );

  return (
    <div className="leave-request-layout">

      {/* Sidebar Navigation */}
      <aside className="sidebar">

        <div className="brand-section">

          <div className="brand-header">
            <div className="brand-icon">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.125rem' }}
              >
                check
              </span>
            </div>

            <span className="font-headline-sm font-bold text-on-surface">
              LeaveFlow
            </span>
          </div>

          <div className="nav-container">
            <nav className="nav-list">

              <button
                className="nav-link active font-label-lg"
                type="button"
                onClick={() => navigate('/leave-request')}
              >
                <div className="nav-link-content">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1.125rem' }}
                  >
                    pending_actions
                  </span>

                  <span>Pending Approvals</span>
                </div>

                <span className="badge-count font-label-sm font-bold">
                  {pendingRequests.length}
                </span>
              </button>

              <button
                className="nav-link font-label-lg"
                type="button"
                onClick={() => navigate('/overview')}
              >
                <div className="nav-link-content">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1.125rem' }}
                  >
                    groups
                  </span>

                  <span>Team Overview</span>
                </div>
              </button>

            </nav>
          </div>
        </div>

        <div className="sidebar-profile">

          <div className="profile-card">

            <div className="profile-avatar-circle font-semibold text-sm">
              {getInitials(
                getAuthData().user?.name || 'Manager'
              )}
            </div>

            <div className="profile-meta">

              <span className="font-label-md font-semibold text-on-surface truncate">
                {getAuthData().user?.name || 'Manager'}
              </span>

              <span
                className="font-label-sm text-on-surface-variant truncate"
                style={{ textTransform: 'none' }}
              >
                Manager
              </span>

            </div>

          </div>

        </div>
      </aside>

      {/* Main Page Area */}
      <div className="main-viewport">

        <main className="main-content">

          <div className="content-container">

            {/* Header */}
            <div>
              <h1 className="font-headline-lg text-on-surface">
                Leave Requests
              </h1>
            </div>

            {/* Filter and Search */}
            <div className="filter-search-row">

              <div className="search-and-segmented">

                <div className="search-box">

                  <span
                    className="material-symbols-outlined search-icon"
                    style={{ fontSize: '1.125rem' }}
                  >
                    search
                  </span>

                  <input
                    className="search-input font-body-md"
                    placeholder="Filter by employee name..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                  />

                </div>

                <div className="segmented-control">

                  <button
                    className={`segmented-btn font-label-md ${
                      filterType === 'all' ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </button>

                  <button
                    className={`segmented-btn font-label-md ${
                      filterType === 'Earned' ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => setFilterType('Earned')}
                  >
                    Earned
                  </button>

                  <button
                    className={`segmented-btn font-label-md ${
                      filterType === 'Sick' ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => setFilterType('Sick')}
                  >
                    Sick
                  </button>

                </div>
              </div>

              <div className="filter-actions">

                <div className="date-pill font-label-md">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1.125rem' }}
                  >
                    calendar_month
                  </span>

                  <span>Leave Requests</span>
                </div>

              </div>
            </div>

            {/* Requests List */}
            <div className="table-panel">

              <div className="table-header">

                <div className="header-left-title">

                  <span className="font-headline-sm text-on-surface">
                    Pending Submissions
                  </span>

                  <span className="count-pill font-label-sm font-semibold">
                    {pendingRequests.length} pending
                  </span>

                </div>

                <span className="font-body-sm text-on-surface-variant">
                  Showing employee leave requests
                </span>

              </div>

              <div className="requests-list">

                {filteredRequests.map((request) => {

                  const days = calculateDays(
                    request.start_date,
                    request.end_date
                  );

                  return (
                    <div
                      key={request.id}
                      className="request-item"
                    >

                      {/* Employee */}
                      <div className="employee-info-col">

                        <div className="employee-avatar">
                          {getInitials(
                            request.employee_name
                          )}
                        </div>

                        <div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >

                            <span className="font-label-lg font-semibold text-on-surface">
                              {request.employee_name}
                            </span>

                            <span
                              className={`leave-tag font-label-sm ${
                                request.leave_type === 'Sick'
                                  ? 'sick'
                                  : ''
                              }`}
                            >
                              {request.leave_type}
                            </span>

                          </div>

                          <span className="font-body-sm text-on-surface-variant">
                            {request.employee_email}
                          </span>

                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="request-details-col">

                        <div>

                          <div className="date-indicator font-label-md">

                            <span
                              className="material-symbols-outlined text-primary"
                              style={{ fontSize: '1rem' }}
                            >
                              calendar_today
                            </span>

                            <span>
                              {formatDateRange(request)}
                            </span>

                          </div>

                          <span
                            className="font-body-sm text-on-surface-variant"
                            style={{
                              marginTop: '0.125rem',
                              display: 'block'
                            }}
                          >
                            &ldquo;{request.reason}&rdquo;
                          </span>

                        </div>

                        <div className="balance-impact-meta">

                          <span
                            className="font-label-sm text-on-surface-variant"
                            style={{ display: 'block' }}
                          >
                            Status
                          </span>

                          <span className="font-label-md text-on-surface">
                            {request.status}
                          </span>

                        </div>

                      </div>

                      {/* Actions */}
                      <div className="request-actions-col">

                        {request.status === 'PENDING' ? (
                          <>
                            <button
                              className="btn-action-reject font-label-md"
                              type="button"
                              onClick={() => {
                                setActiveRequest(request);
                                setManagerNotes('');
                              }}
                            >
                              Reject
                            </button>

                            <button
                              className="btn-action-approve font-label-md"
                              type="button"
                              onClick={() => {
                                setActiveRequest(request);
                                setManagerNotes('');
                              }}
                            >
                              Approve
                            </button>
                          </>
                        ) : (
                          <span className="font-label-sm text-on-surface-variant">
                            {request.status}
                          </span>
                        )}

                      </div>

                    </div>
                  );
                })}

                {/* Empty State */}
                {filteredRequests.length === 0 && (
                  <div className="empty-state">

                    <div className="empty-icon-wrap">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '1.875rem' }}
                      >
                        task_alt
                      </span>
                    </div>

                    <h3 className="font-headline-md text-on-surface">
                      All caught up!
                    </h3>

                    <p
                      className="font-body-md text-on-surface-variant"
                      style={{
                        maxWidth: '24rem',
                        marginTop: '0.25rem'
                      }}
                    >
                      There are no leave requests matching your current filters.
                    </p>

                  </div>
                )}

              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Audit & Review Modal */}
      {activeRequest && (
        <div className="modal-backdrop">

          <div className="drawer-dialog">

            <div className="drawer-header">

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >

                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: '1.25rem' }}
                >
                  fact_check
                </span>

                <h2 className="font-headline-md text-on-surface">
                  Leave Request Audit
                </h2>

              </div>

              <button
                type="button"
                style={{
                  padding: '0.375rem',
                  color: 'var(--on-surface-variant)'
                }}
                onClick={() => {
                  setActiveRequest(null);
                  setManagerNotes('');
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '1.25rem' }}
                >
                  close
                </span>
              </button>

            </div>

            <div className="drawer-body">

              {/* Employee */}
              <div className="employee-card-row">

                <div className="drawer-avatar-fallback font-headline-sm">
                  {getInitials(activeRequest.employee_name)}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >

                  <span className="font-headline-sm text-on-surface">
                    {activeRequest.employee_name}
                  </span>

                  <span className="font-body-sm text-on-surface-variant">
                    {activeRequest.employee_email}
                  </span>

                </div>

              </div>

              {/* Details */}
              <div className="details-grid">

                <div className="detail-card">

                  <span className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                    Classification
                  </span>

                  <span
                    className="font-label-lg font-semibold text-on-surface"
                    style={{ marginTop: '0.25rem' }}
                  >
                    {activeRequest.leave_type} Leave
                  </span>

                </div>

                <div className="detail-card">

                  <span className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                    Calculated Impact
                  </span>

                  <span
                    className="font-label-lg font-semibold text-primary"
                    style={{ marginTop: '0.25rem' }}
                  >
                    {calculateDays(
                      activeRequest.start_date,
                      activeRequest.end_date
                    )}{' '}
                    Days
                  </span>

                </div>

                <div className="detail-card span-2">

                  <span className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                    Selected Span
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.25rem'
                    }}
                  >

                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontSize: '1rem' }}
                    >
                      date_range
                    </span>

                    <span className="font-label-lg text-on-surface">
                      {formatDate(activeRequest.start_date)}
                      {' – '}
                      {formatDate(activeRequest.end_date)}
                    </span>

                  </div>

                </div>

              </div>

              {/* Leave Information */}
              <div className="ledger-container">

                <span className="font-label-md font-semibold text-on-surface">
                  Leave Request Information
                </span>

                <div className="ledger-row">

                  <span className="font-body-md text-on-surface-variant">
                    Leave Type:
                  </span>

                  <span className="font-label-lg font-semibold text-on-surface">
                    {activeRequest.leave_type}
                  </span>

                </div>

                <div className="ledger-row">

                  <span className="font-body-md text-on-surface-variant">
                    Duration:
                  </span>

                  <span className="font-label-lg font-semibold text-on-surface">
                    {calculateDays(
                      activeRequest.start_date,
                      activeRequest.end_date
                    )}{' '}
                    Days
                  </span>

                </div>

                <div className="ledger-row highlight">

                  <span className="font-label-md font-semibold text-on-surface">
                    Current Status:
                  </span>

                  <span className="font-headline-sm text-primary font-bold">
                    {activeRequest.status}
                  </span>

                </div>

              </div>

              {/* Employee Reason */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >

                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Employee Statement
                </span>

                <div className="reason-box font-body-md text-on-surface">
                  &ldquo;{activeRequest.reason}&rdquo;
                </div>

              </div>

              {/* Manager Comment */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >

                <label
                  className="font-label-md font-semibold text-on-surface"
                  htmlFor="manager-notes"
                >
                  Manager Audit Notes / Reason
                </label>

                <textarea
                  className="textarea-notes font-body-md"
                  id="manager-notes"
                  placeholder="Add contextual commentary or instructions for the employee..."
                  rows="3"
                  value={managerNotes}
                  onChange={(e) =>
                    setManagerNotes(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer">

              <button
                className="btn-reject-confirm font-label-lg font-semibold"
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  handleAction(
                    activeRequest.id,
                    'REJECTED'
                  )
                }
              >

                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '1rem' }}
                >
                  close
                </span>

                <span>
                  {isUpdating
                    ? 'Updating...'
                    : 'Confirm Rejection'}
                </span>

              </button>

              <button
                className="btn-approve-confirm font-label-lg font-semibold"
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  handleAction(
                    activeRequest.id,
                    'APPROVED'
                  )
                }
              >

                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '1rem' }}
                >
                  check_circle
                </span>

                <span>
                  {isUpdating
                    ? 'Updating...'
                    : 'Confirm Approval'}
                </span>

              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
