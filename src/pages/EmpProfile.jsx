import React, { useEffect, useState } from 'react';
import './EmpProfile.css';
import { useNavigate } from 'react-router-dom';

export default function EmpProfile() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);

  const [balance, setBalance] = useState({
    earned: 12,
    sick: 10
  });

  const [leaves, setLeaves] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');

  // Financial year
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState('');

  // Leave history filter
  const [selectedLeaveFilter, setSelectedLeaveFilter] =
    useState('ALL');


  // =====================================================
  // GET CURRENT FINANCIAL YEAR
  // Indian Financial Year = April to March
  // =====================================================

  const getCurrentFinancialYear = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (month >= 4) {
      return `${year}-${year + 1}`;
    }

    return `${year - 1}-${year}`;
  };


  // =====================================================
  // GENERATE FINANCIAL YEAR OPTIONS
  // =====================================================

  const generateFinancialYears = () => {
    const currentFinancialYear = getCurrentFinancialYear();

    const currentStartYear =
      Number(currentFinancialYear.split('-')[0]);

    return [
      `${currentStartYear + 1}-${currentStartYear + 2}`,
      `${currentStartYear}-${currentStartYear + 1}`,
      `${currentStartYear - 1}-${currentStartYear}`,
      `${currentStartYear - 2}-${currentStartYear - 1}`,
      `${currentStartYear - 3}-${currentStartYear - 2}`
    ];
  };


  const financialYears = generateFinancialYears();


  // =====================================================
  // SET CURRENT FINANCIAL YEAR
  // =====================================================

  useEffect(() => {
    setSelectedFinancialYear(
      getCurrentFinancialYear()
    );
  }, []);


  // =====================================================
  // GET AUTH DATA
  // =====================================================

  const getAuthData = () => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    return {
      token,
      user: storedUser
        ? JSON.parse(storedUser)
        : null
    };
  };


  // =====================================================
  // FETCH EMPLOYEE DATA
  // =====================================================

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const {
        token,
        user
      } = getAuthData();


      // No authentication
      if (!token || !user) {
        navigate('/login');
        return;
      }


      // Employee only
      if (user.role !== 'employee') {
        navigate('/overview');
        return;
      }


      setUser(user);


      const headers = {
        Authorization: `Bearer ${token}`
      };


      // Fetch balance and leaves together
      const [
        balanceResponse,
        leavesResponse
      ] = await Promise.all([

        fetch(
          'http://localhost:5000/api/leaves/balance',
          {
            method: 'GET',
            headers
          }
        ),

        fetch(
          'http://localhost:5000/api/leaves/my',
          {
            method: 'GET',
            headers
          }
        )

      ]);


      const balanceData =
        await balanceResponse.json();

      const leavesData =
        await leavesResponse.json();


      // Balance error
      if (!balanceResponse.ok) {
        throw new Error(
          balanceData.message ||
          'Failed to fetch leave balance'
        );
      }


      // Leaves error
      if (!leavesResponse.ok) {
        throw new Error(
          leavesData.message ||
          'Failed to fetch leave requests'
        );
      }


      setBalance(
        balanceData.balance || {
          earned: 12,
          sick: 10
        }
      );


      setLeaves(
        leavesData.leaves || []
      );

    } catch (error) {

      console.error(
        'Employee data error:',
        error
      );

      setErrorMessage(
        error.message ||
        'Something went wrong'
      );

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchEmployeeData();
  }, []);


  // =====================================================
  // APPLY LEAVE
  // =====================================================

  const onApplyLeaveClick = () => {
    navigate('/leave-form');
  };


  // =====================================================
  // CANCEL LEAVE
  // =====================================================

  const handleCancelLeave = async (leaveId) => {

    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this leave request?'
    );


    if (!confirmCancel) {
      return;
    }


    try {

      const { token } = getAuthData();


      if (!token) {
        navigate('/login');
        return;
      }


      const response = await fetch(
        `http://localhost:5000/api/leaves/${leaveId}/cancel`,
        {
          method: 'PUT',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to cancel leave'
        );
      }


      // Refresh data
      await fetchEmployeeData();

    } catch (error) {

      console.error(
        'Cancel leave error:',
        error
      );

      alert(
        error.message ||
        'Failed to cancel leave'
      );
    }
  };


  // =====================================================
  // CALCULATE DURATION
  // =====================================================

  const calculateDuration = (
    startDate,
    endDate
  ) => {

    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference =
      Math.floor(
        (end - start) /
        (1000 * 60 * 60 * 24)
      ) + 1;

    return difference;
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };


  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {

    switch (status) {

      case 'PENDING':
        return 'Pending Review';

      case 'APPROVED':
        return 'Approved';

      case 'REJECTED':
        return 'Rejected';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  };


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    switch (status) {

      case 'PENDING':
        return 'pending';

      case 'APPROVED':
        return 'approved';

      case 'REJECTED':
        return 'rejected';

      case 'CANCELLED':
        return 'cancelled';

      default:
        return '';
    }
  };


  // =====================================================
  // CHECK FINANCIAL YEAR
  // =====================================================

  const isLeaveInFinancialYear = (leave) => {

    if (
      !leave.start_date ||
      !selectedFinancialYear
    ) {
      return true;
    }


    const [
      startYear
    ] = selectedFinancialYear
      .split('-')
      .map(Number);


    // Avoid timezone problems by reading YYYY-MM-DD directly
    const [
      leaveYear,
      leaveMonth
    ] = String(leave.start_date)
      .split('-')
      .map(Number);


    return (
      (leaveYear === startYear && leaveMonth >= 4) ||
      (
        leaveYear === startYear + 1 &&
        leaveMonth <= 3
      )
    );
  };


  // =====================================================
  // FILTER LEAVES
  // =====================================================

  const filteredLeaves = leaves.filter(
    (leave) => {

      const matchesFinancialYear =
        isLeaveInFinancialYear(leave);


      if (!matchesFinancialYear) {
        return false;
      }


      // All
      if (selectedLeaveFilter === 'ALL') {
        return true;
      }


      // Leave type filters
      if (
        selectedLeaveFilter === 'Earned' ||
        selectedLeaveFilter === 'Sick'
      ) {
        return (
          leave.leave_type === selectedLeaveFilter
        );
      }


      // Status filters
      return (
        leave.status === selectedLeaveFilter
      );
    }
  );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="login-page-wrapper">

        <h2>
          Loading employee dashboard...
        </h2>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (errorMessage) {

    return (
      <div className="login-page-wrapper">

        <h2>
          Something went wrong
        </h2>

        <p>
          {errorMessage}
        </p>


        <button
          className="btn-primary"
          type="button"
          onClick={fetchEmployeeData}
        >
          Try Again
        </button>

      </div>
    );
  }


  // =====================================================
  // USER CHECK
  // =====================================================

  if (!user) {
    return null;
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="app-main">

      <div className="workspace-container">


        {/* =================================================
            WELCOME + TOP CONTROLS
            ================================================= */}

        <div className="page-header">

          {/* LEFT SIDE */}
          <div className="welcome-content">

            <div className="breadcrumbs">

              <span className="tag-primary">
                Employee Workspace
              </span>

              <span className="dot-separator"></span>

              <span className="fiscal-period">
                Leave Management
              </span>

            </div>


            <h1 className="page-title">
              Welcome back, {user.name}
            </h1>

          </div>


          {/* RIGHT SIDE */}
          <div className="controls-section">

            {/* Financial Year */}

            <div className="control-dropdown">

              <span className="filter-label">
                Financial Year:
              </span>


              <select
                value={selectedFinancialYear}
                onChange={(e) =>
                  setSelectedFinancialYear(
                    e.target.value
                  )
                }
                className="control-select"
              >

                {financialYears.map(
                  (financialYear) => (

                    <option
                      key={financialYear}
                      value={financialYear}
                    >
                      {financialYear.replace(
                        '-',
                        ' - '
                      )}
                    </option>

                  )
                )}

              </select>
            </div>


            {/* Apply Leave */}

            <button
              className="btn-primary"
              type="button"
              onClick={onApplyLeaveClick}
            >

              <span className="material-symbols-outlined">
                add
              </span>

              <span>
                Apply for Leave
              </span>

            </button>

          </div>

        </div>



        {/* =================================================
            STATS CARDS
            ================================================= */}

        <div className="stats-grid">


          {/* Earned Leave */}

          <div className="stat-card">

            <div className="stat-header">

              <span className="stat-title">
                Earned Leave
              </span>

              <span className="stat-subtitle">
                Fixed 12d
              </span>

            </div>


            <div className="stat-body">

              <span className="stat-number">
                {balance.earned}
              </span>

              <span className="stat-text">
                / 12 days remaining
              </span>

            </div>


            <div className="stat-footer">
              {12 - balance.earned} used
            </div>

          </div>


          {/* Sick Leave */}

          <div className="stat-card">

            <div className="stat-header">

              <span className="stat-title">
                Sick Leave
              </span>

              <span className="stat-subtitle">
                Fixed 10d
              </span>

            </div>


            <div className="stat-body">

              <span className="stat-number">
                {balance.sick}
              </span>

              <span className="stat-text">
                / 10 days remaining
              </span>

            </div>


            <div className="stat-footer">
              {10 - balance.sick} used
            </div>

          </div>

        </div>


        {/* =================================================
            LEAVE REQUESTS HEADER
            ================================================= */}

        <div className="section-header">

          <h2 className="section-title">
            Leave Requests
          </h2>

          <div>
          <span className="badge-count">
            {filteredLeaves.length}
          </span>
          </div>


          {/* Leave History Filter */}

          <div className="filters">


            <div className="filter-dropdown">

              <span className="filter-label">
                Leave History:
              </span>


              <select
                value={selectedLeaveFilter}
                onChange={(e) =>
                  setSelectedLeaveFilter(
                    e.target.value
                  )
                }
                className="leave-type-select"
              >

                <option value="ALL">
                  All
                </option>

                <option value="Earned">
                  Earned
                </option>

                <option value="Sick">
                  Sick
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

              </select>

              <span className="material-symbols-outlined icon-small" >
                expand_more
              </span>


            </div>

          </div>

        </div>


        {/* =================================================
            TABLE
            ================================================= */}

        <div className="table-card">

          <div className="table-responsive">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Leave Type
                  </th>

                  <th>
                    Dates
                  </th>

                  <th>
                    Duration
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="text-right">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredLeaves.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center"
                    >
                      No leave requests found.
                    </td>

                  </tr>

                ) : (

                  filteredLeaves.map(
                    (leave) => {

                      const duration =
                        calculateDuration(
                          leave.start_date,
                          leave.end_date
                        );


                      return (

                        <tr key={leave.id}>


                          {/* Leave Type */}

                          <td className="fw-medium text-on-surface">

                            {leave.leave_type}
                            {' '}
                            Leave

                          </td>


                          {/* Dates */}

                          <td className="text-secondary">

                            {formatDate(
                              leave.start_date
                            )}

                            {' – '}

                            {formatDate(
                              leave.end_date
                            )}

                          </td>


                          {/* Duration */}

                          <td className="text-on-surface">

                            {duration}

                            {' '}

                            {duration === 1
                              ? 'Day'
                              : 'Days'}

                          </td>


                          {/* Reason */}

                          <td
                            className="text-secondary"
                            title={leave.reason}
                          >

                            <div>
                              {leave.reason}
                            </div>


                            {leave.manager_comment && (

                              <div className="manager-comment">

                                <strong>
                                  Manager:
                                </strong>

                                {' '}

                                {leave.manager_comment}

                              </div>

                            )}

                          </td>


                          {/* Status */}

                          <td>

                            <span
                              className={`status-badge ${getStatusClass(
                                leave.status
                              )}`}
                            >

                              <span className="status-dot"></span>

                              {getStatusLabel(
                                leave.status
                              )}

                            </span>

                          </td>


                          {/* Action */}

                          <td className="text-right">

                            {leave.status === 'PENDING' ? (

                              <button
                                className="btn-text text-error"
                                type="button"
                                onClick={() =>
                                  handleCancelLeave(
                                    leave.id
                                  )
                                }
                              >
                                Cancel
                              </button>

                            ) : (

                              <span className="text-secondary">
                                —
                              </span>

                            )}

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </main>
  );
}