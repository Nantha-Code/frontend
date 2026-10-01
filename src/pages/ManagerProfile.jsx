
import React, { useEffect, useState } from 'react';
import './ManagerProfile.css';
import { useLocation, useNavigate } from 'react-router-dom';

// Sidebar Navigation
function Sidebar({ pendingCount = 0, managerName = 'Manager' }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
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

          <span className="font-headline-sm font-bold text-on-surface tracking-tight">
            LeaveFlow
          </span>
        </div>

        <div className="nav-container">
          <nav className="nav-list">

            <button
              className="nav-link font-label-lg"
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
                {pendingCount}
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
            {getInitials(managerName)}
          </div>

          <div className="profile-meta">
            <span className="font-label-md font-semibold text-on-surface truncate">
              {managerName}
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
  );
}


// Breadcrumb
function BreadcrumbBar({ employeeName }) {
  const navigate = useNavigate();

  return (
    <div className="breadcrumb-row">
      <div className="breadcrumb-trail">

        <button
          className="btn-back font-label-md"
          type="button"
          onClick={() => navigate('/overview')}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '0.875rem' }}
          >
            arrow_back
          </span>

          <span>Back to Team Overview</span>
        </button>

        <span style={{ color: '#c3c6d7' }} className="font-label-md">
          /
        </span>

        <span className="font-label-md text-on-surface-variant">
          Team Overview
        </span>

        <span style={{ color: '#c3c6d7' }} className="font-label-md">
          /
        </span>

        <span className="font-label-md text-on-surface font-semibold">
          {employeeName}
        </span>

      </div>
    </div>
  );
}


// Employee Profile Banner
function ProfileBanner({ employee, pendingCount }) {
  const employeeName = employee?.employee_name || 'Employee';
  const employeeEmail = employee?.employee_email || '';

  const getInitials = (name) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const profileStatus =
    pendingCount > 0 ? 'Pending Review' : 'No Pending Requests';

  const isPending = pendingCount > 0;

  return (
    <div className="employee-profile-banner">

      <div className="banner-left">

        <div className="avatar-wrapper">
          <div className="banner-avatar-img member-initials-avatar">
            {getInitials(employeeName)}
          </div>

          <div className="online-status-dot-wrap">
            <span className="status-dot-inner"></span>
          </div>
        </div>

        <div>

          <div className="profile-heading-group">

            <h1 className="font-headline-md font-bold text-on-surface tracking-tight">
              {employeeName}
            </h1>

            <span
              className={`status-pill font-label-sm font-semibold ${
                isPending ? 'amber' : 'emerald'
              }`}
            >
              <span
                className={`status-dot-inner ${
                  isPending
                    ? 'dot-amber animate-pulse'
                    : 'dot-emerald'
                }`}
              ></span>

              {profileStatus}
            </span>

          </div>

          <div className="profile-meta-tags font-body-sm">

            <span className="meta-tag-item">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                badge
              </span>

              Employee
            </span>

            <span className="meta-tag-item">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                person
              </span>

              Leave Management
            </span>

            <span
              className="meta-tag-item text-primary"
              style={{ cursor: 'pointer' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '0.875rem' }}
              >
                mail
              </span>

              {employeeEmail}
            </span>

          </div>

        </div>
      </div>

      <div className="banner-action-buttons">

        <a
          className="btn-banner-message font-label-md"
          href={`mailto:${employeeEmail}`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '1rem' }}
          >
            mail
          </span>

          <span>Message</span>
        </a>

      </div>

    </div>
  );
}


// Leave Summary
function BalanceCards({ items }) {
  const approvedEarned = items
    .filter(
      (item) =>
        item.leave_type === 'Earned' &&
        item.status === 'APPROVED'
    )
    .reduce(
      (total, item) => total + calculateDays(item.start_date, item.end_date),
      0
    );

  const approvedSick = items
    .filter(
      (item) =>
        item.leave_type === 'Sick' &&
        item.status === 'APPROVED'
    )
    .reduce(
      (total, item) => total + calculateDays(item.start_date, item.end_date),
      0
    );

  return (
    <div className="balance-grid">

      <div className="balance-card">

        <div>
          <div className="balance-card-header">

            <div>
              <div className="card-label-group">

                <span
                  className="type-indicator-circle"
                  style={{ backgroundColor: '#004ac6' }}
                ></span>

                <span className="font-label-md font-semibold text-on-surface tracking-wider uppercase">
                  Earned Leave
                </span>

              </div>

              <p
                className="font-body-sm text-on-surface-variant"
                style={{ marginTop: '0.125rem' }}
              >
                Approved leave used
              </p>
            </div>

            <span className="cycle-tag font-label-sm font-semibold">
              2026
            </span>

          </div>

          <div className="stat-row">

            <div className="stat-group">

              <span className="font-stat-display text-on-surface">
                {approvedEarned}
              </span>

              <span className="font-body-md text-on-surface-variant font-medium">
                / 12 days used
              </span>

            </div>

          </div>

        </div>

        <div className="balance-card-footer font-body-sm">

          <span className="footer-legend-item">
            Approved:
            <strong className="text-on-surface font-semibold">
              {approvedEarned} days
            </strong>
          </span>

          <span className="text-secondary font-label-sm">
            Annual allowance: 12 days
          </span>

        </div>

      </div>


      <div className="balance-card">

        <div>

          <div className="balance-card-header">

            <div>

              <div className="card-label-group">

                <span
                  className="type-indicator-circle"
                  style={{ backgroundColor: '#515f74' }}
                ></span>

                <span className="font-label-md font-semibold text-on-surface tracking-wider uppercase">
                  Sick Leave
                </span>

              </div>

              <p
                className="font-body-sm text-on-surface-variant"
                style={{ marginTop: '0.125rem' }}
              >
                Approved leave used
              </p>

            </div>

            <span className="cycle-tag font-label-sm font-semibold">
              2026
            </span>

          </div>

          <div className="stat-row">

            <div className="stat-group">

              <span className="font-stat-display text-on-surface">
                {approvedSick}
              </span>

              <span className="font-body-md text-on-surface-variant font-medium">
                / 10 days used
              </span>

            </div>

          </div>

        </div>

        <div className="balance-card-footer font-body-sm">

          <span className="footer-legend-item">
            Approved:
            <strong className="text-on-surface font-semibold">
              {approvedSick} days
            </strong>
          </span>

          <span className="text-secondary font-label-sm">
            Annual allowance: 10 days
          </span>

        </div>

      </div>

    </div>
  );
}


// Calculate calendar days
function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.floor(
    (end - start) / (1000 * 60 * 60 * 24)
  ) + 1;
}


// Table Filter
function TableFilterBar({ searchQuery, onSearchChange }) {
  return (
    <div className="table-filter-bar">

      <div className="filter-controls-left">

        <div className="filter-dropdown-pill font-label-md">
          <span
            className="material-symbols-outlined text-secondary"
            style={{ fontSize: '1rem' }}
          >
            event_repeat
          </span>

          <span className="font-semibold text-on-surface">
            2026
          </span>
        </div>

      </div>

      <div className="search-and-export-right">

        <div className="search-input-wrapper">

          <span
            className="material-symbols-outlined search-icon"
            style={{ fontSize: '1rem' }}
          >
            search
          </span>

          <input
            className="search-input-field font-body-sm"
            placeholder="Search reason or leave type..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />

        </div>

      </div>

    </div>
  );
}


// Request History Table
function HistoryTable({ items, onApprove, onReject }) {

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="history-table-panel">

      <div className="history-header">

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >

          <h2 className="font-headline-sm font-bold text-on-surface">
            Leave Request History
          </h2>

          <span className="count-bubble font-label-sm font-semibold">
            {items.length} Total
          </span>

        </div>

        <span className="font-body-sm text-on-surface-variant">
          Leave records from PostgreSQL
        </span>

      </div>


      <div style={{ width: '100%', overflowX: 'auto' }}>

        <table className="history-table font-body-sm">

          <thead className="font-label-md uppercase tracking-wider">

            <tr>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {items.map((item) => {

              const isPending = item.status === 'PENDING';

              return (
                <tr
                  key={item.id}
                  className={isPending ? 'pending-row' : ''}
                >

                  <td>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >

                      <span
                        className="type-indicator-circle"
                        style={{
                          backgroundColor:
                            item.leave_type === 'Earned'
                              ? '#004ac6'
                              : '#515f74',
                          width: '0.5rem',
                          height: '0.5rem'
                        }}
                      ></span>

                      <span className="font-label-lg font-semibold text-on-surface">
                        {item.leave_type}
                      </span>

                    </div>

                  </td>


                  <td>

                    <span className="font-medium text-on-surface">
                      {formatDate(item.start_date)}
                      {' – '}
                      {formatDate(item.end_date)}
                    </span>

                  </td>


                  <td>

                    <span className="days-tag font-label-md font-semibold">
                      {calculateDays(
                        item.start_date,
                        item.end_date
                      )}{' '}
                      day(s)
                    </span>

                  </td>


                  <td style={{ maxWidth: '20rem' }}>

                    <p
                      className="text-on-surface font-medium truncate"
                      title={item.reason}
                    >
                      {item.reason}
                    </p>

                    <span className="text-secondary font-label-sm">
                      Applied: {formatDate(
                        item.applied_at?.split('T')[0]
                      )}
                    </span>

                  </td>


                  <td>

                    <span
                      className={`status-pill font-label-sm font-semibold ${
                        item.status === 'APPROVED'
                          ? 'emerald'
                          : item.status === 'REJECTED'
                          ? 'rose'
                          : item.status === 'CANCELLED'
                          ? 'rose'
                          : 'amber'
                      }`}
                    >

                      <span
                        className={`status-dot-inner ${
                          item.status === 'APPROVED'
                            ? 'dot-emerald'
                            : item.status === 'REJECTED' ||
                              item.status === 'CANCELLED'
                            ? 'dot-rose'
                            : 'dot-amber animate-pulse'
                        }`}
                      ></span>

                      {item.status}

                    </span>

                  </td>


                  <td>

                    {isPending ? (

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.5rem'
                        }}
                      >

                        <button
                          className="btn-table-action-reject font-label-sm font-semibold"
                          type="button"
                          onClick={() => onReject(item.id)}
                        >
                          Reject
                        </button>

                        <button
                          className="btn-table-action-approve font-label-sm font-semibold"
                          type="button"
                          onClick={() => onApprove(item.id)}
                        >
                          Approve
                        </button>

                      </div>

                    ) : (

                      <span className="font-label-sm text-on-surface-variant">
                        {item.manager_comment || 'Processed'}
                      </span>

                    )}

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>


      <div className="table-footer-pagination font-body-sm text-on-surface-variant">

        <span>
          Showing{' '}
          <strong className="text-on-surface font-medium">
            {items.length === 0 ? 0 : 1}-{items.length}
          </strong>{' '}
          of{' '}
          <strong className="text-on-surface font-medium">
            {items.length}
          </strong>{' '}
          records
        </span>

      </div>

    </div>
  );
}


// Main Component
export default function ManagerProfile() {

  const navigate = useNavigate();
  const location = useLocation();

  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getStoredUser = () => {
    try {
      const storedUser =
        localStorage.getItem('user') ||
        sessionStorage.getItem('user');

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const getToken = () => {
    return (
      localStorage.getItem('token') ||
      sessionStorage.getItem('token')
    );
  };


  // Fetch all manager-visible leave requests
  useEffect(() => {

    const fetchHistory = async () => {

      const user = getStoredUser();
      const token = getToken();

      if (!user || user.role !== 'manager') {
        navigate('/login');
        return;
      }

      if (!token) {
        navigate('/login');
        return;
      }

      try {

        setLoading(true);
        setError('');

        const response = await fetch(
          'https://leaveflow-backend-emz2.onrender.com/api/leaves/manager',
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
            data.message || 'Failed to load employee leave history'
          );
        }

        const selectedEmployeeId =
          location.state?.employeeId;

        let leaves = data.leaves || [];

        // If an employee ID was provided,
        // show only that employee's requests.
        if (selectedEmployeeId) {
          leaves = leaves.filter(
            (leave) => leave.user_id === selectedEmployeeId
          );
        }

        setHistory(leaves);

      } catch (error) {

        console.error('Manager profile error:', error);

        setError(
          error.message ||
          'Failed to load employee leave history'
        );

      } finally {

        setLoading(false);

      }
    };

    fetchHistory();

  }, [navigate, location.state]);


  const manager = getStoredUser();

  const managerName = manager?.name || 'Manager';


  // Selected employee
  const selectedEmployee =
    history.length > 0
      ? history[0]
      : null;


  const employee = selectedEmployee
    ? {
        employee_name: selectedEmployee.employee_name,
        employee_email: selectedEmployee.employee_email
      }
    : {
        employee_name:
          location.state?.employeeName || 'Employee',
        employee_email:
          location.state?.employeeEmail || ''
      };


  // Pending requests
  const pendingCount = history.filter(
    (item) => item.status === 'PENDING'
  ).length;


  // Approve request
  const handleApprove = async (id) => {

    const token = getToken();

    try {

      setActionLoading(true);

      const response = await fetch(
        `https://leaveflow-backend-emz2.onrender.com/api/leaves/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: 'APPROVED',
            managerComment: ''
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to approve leave'
        );
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'APPROVED',
                manager_comment: ''
              }
            : item
        )
      );

    } catch (error) {

      alert(error.message || 'Failed to approve leave');

    } finally {

      setActionLoading(false);

    }
  };


  // Reject request
  const handleReject = async (id) => {

    const token = getToken();

    try {

      setActionLoading(true);

      const response = await fetch(
        `https://leaveflow-backend-emz2.onrender.com/api/leaves/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: 'REJECTED',
            managerComment: ''
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to reject leave'
        );
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'REJECTED',
                manager_comment: ''
              }
            : item
        )
      );

    } catch (error) {

      alert(error.message || 'Failed to reject leave');

    } finally {

      setActionLoading(false);

    }
  };


  // Search
  const filteredHistory = history.filter((item) => {

    const query = searchQuery.toLowerCase().trim();

    return (
      item.reason?.toLowerCase().includes(query) ||
      item.leave_type?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    );

  });


  return (
    <div className="manager-profile-layout">

      <header className="top-blur-header"></header>


      {/* Sidebar */}
      <Sidebar
        pendingCount={pendingCount}
        managerName={managerName}
      />


      {/* Main Content */}
      <div className="main-viewport">

        <main className="main-content">

          <div className="content-container">

            {/* Breadcrumb */}
            <BreadcrumbBar
              employeeName={employee.employee_name}
            />


            {/* Profile */}
            <ProfileBanner
              employee={employee}
              pendingCount={pendingCount}
            />


            {/* Leave Summary */}
            <BalanceCards
              items={history}
            />


            {/* Search */}
            <TableFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />


            {/* Loading */}
            {loading && (
              <div className="font-body-md text-on-surface-variant">
                Loading employee leave history...
              </div>
            )}


            {/* Error */}
            {!loading && error && (
              <div className="font-body-md text-on-surface-variant">
                {error}
              </div>
            )}


            {/* History */}
            {!loading && !error && (
              <HistoryTable
                items={filteredHistory}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}


            {actionLoading && (
              <div className="font-body-sm text-on-surface-variant">
                Updating leave request...
              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

