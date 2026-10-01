import React, { useEffect, useState } from 'react';
import './OverView.css';
import { useNavigate } from 'react-router-dom';

// Sidebar Navigation
function Sidebar({ pendingCount = 0, managerName = "Manager" }) {
  const navigate = useNavigate();

  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((name) => name[0])
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
              className="nav-link active font-label-lg"
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


// Search and Filter Control
function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange
}) {
  return (
    <div className="filter-bar">

      <div className="search-field-wrap">
        <span
          className="material-symbols-outlined search-icon"
          style={{ fontSize: '1.125rem' }}
        >
          search
        </span>

        <input
          type="text"
          placeholder="Search employee by name or email..."
          className="search-input font-body-sm"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-selects">

        <div className="select-wrapper">
          <select
            className="filter-dropdown font-label-md"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="All Statuses">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <span
            className="material-symbols-outlined chevron-icon"
            style={{ fontSize: '1rem' }}
          >
            expand_more
          </span>
        </div>

      </div>
    </div>
  );
}


// Individual Employee Row
function MemberRow({ member, onViewDetails }) {
  const statusClass =
    member.status === 'PENDING'
      ? 'pending'
      : 'active';

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="team-member-row">

      <div className="member-identity-col">
        <div className="member-initials-avatar font-bold text-sm">
          {getInitials(member.employee_name)}
        </div>

        <div>
          <span
            className="font-label-lg font-semibold text-on-surface"
            style={{ display: 'block' }}
          >
            {member.employee_name}
          </span>

          <span
            className="font-body-sm text-on-surface-variant"
            style={{ display: 'block' }}
          >
            {member.employee_email}
          </span>
        </div>
      </div>


      <div className="balances-summary-col font-body-sm">

        <div className="balance-item">
          <span
            className="font-label-sm text-on-surface-variant uppercase tracking-wider"
            style={{ display: 'block' }}
          >
            Leave Type
          </span>

          <span className="font-label-md text-on-surface font-semibold">
            {member.leave_type}
          </span>
        </div>


        <div className="balance-item">
          <span
            className="font-label-sm text-on-surface-variant uppercase tracking-wider"
            style={{ display: 'block' }}
          >
            Leave Period
          </span>

          <span className="font-label-md text-on-surface font-semibold">
            {formatDate(member.start_date)} - {formatDate(member.end_date)}
          </span>
        </div>


        <div>
          <span
            className={`status-tag font-label-sm font-semibold ${statusClass}`}
          >
            {member.status}
          </span>
        </div>

      </div>


      <div className="action-col">
        <button
          className="btn-details font-label-md"
          type="button"
          onClick={() => onViewDetails(member)}
        >
          View Details
        </button>
      </div>

    </div>
  );
}


// Main Overview Component
export default function OverView() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Get logged-in manager
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


  // Get token
  const getToken = () => {
    return (
      localStorage.getItem('token') ||
      sessionStorage.getItem('token')
    );
  };


  // Fetch manager leave requests
  useEffect(() => {
    const fetchManagerLeaves = async () => {
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
            data.message || 'Failed to load team overview'
          );
        }

        setRequests(data.leaves || []);

      } catch (error) {
        console.error('Overview error:', error);
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchManagerLeaves();
  }, [navigate]);


  // Get manager name
  const user = getStoredUser();
  const managerName = user?.name || 'Manager';


  // Pending count
  const pendingCount = requests.filter(
    (request) => request.status === 'PENDING'
  ).length;


  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      request.employee_name?.toLowerCase().includes(query) ||
      request.employee_email?.toLowerCase().includes(query);

    const matchesStatus =
      selectedStatus === 'All Statuses' ||
      request.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });


  // View details
  const handleViewDetails = (member) => {
      navigate('/manager-profile', {
        state: {
          employeeId: member.user_id,
          employeeName: member.employee_name,
          employeeEmail: member.employee_email
      }
  });
};


  return (
    <div className="overview-page-layout">

      {/* Sidebar */}
      <Sidebar
        pendingCount={pendingCount}
        managerName={managerName}
      />


      {/* Main View */}
      <div className="main-viewport">

        <main className="main-content">

          <div className="content-container">

            {/* Header */}
            <div className="overview-header">

              <h1 className="font-headline-lg font-bold text-on-surface tracking-tight">
                Team Overview
              </h1>

              <p className="font-body-md text-on-surface-variant">
                Monitor team leave requests and their current status.
              </p>

            </div>


            {/* Filters */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />


            {/* Team Requests */}
            <div className="team-table-panel">

              <div className="panel-header">

                <div className="dept-title-row">

                  <span className="font-headline-sm text-on-surface">
                    Team Leave Requests
                  </span>

                  <span className="member-count-pill font-label-sm font-semibold">
                    {filteredRequests.length} requests
                  </span>

                </div>

                <span className="font-body-sm text-on-surface-variant">
                  Showing leave request records
                </span>

              </div>


              <div className="team-list-rows">

                {loading && (
                  <div className="font-body-md text-on-surface-variant">
                    Loading team requests...
                  </div>
                )}


                {!loading && error && (
                  <div className="font-body-md text-on-surface-variant">
                    {error}
                  </div>
                )}


                {!loading &&
                  !error &&
                  filteredRequests.length === 0 && (
                    <div className="font-body-md text-on-surface-variant">
                      No leave requests found.
                    </div>
                  )}


                {!loading &&
                  !error &&
                  filteredRequests.map((request) => (
                    <MemberRow
                      key={request.id}
                      member={request}
                      onViewDetails={handleViewDetails}
                    />
                  ))}

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
