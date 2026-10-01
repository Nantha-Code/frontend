import React, { useState } from 'react';
import './LeaveForm.css';
import { useNavigate } from 'react-router-dom';

export default function LeaveForm({ onBack }) {
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState('Earned');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = end - start;

    if (diffTime < 0) return 0;

    return Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    ) + 1;
  };

  const duration = calculateDays();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const handleCancel = () => {
    setLeaveType('Earned');
    setStartDate('');
    setEndDate('');
    setReason('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!startDate || !endDate || !reason.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage('End date cannot be before start date.');
      return;
    }

    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://leaveflow-backend-emz2.onrender.com/api/leaves',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            leaveType,
            startDate,
            endDate,
            reason: reason.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to submit leave application.'
        );
      }

      setSuccessMessage(
        data.message || 'Leave application submitted successfully.'
      );

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Leave submission error:', error);
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-wrapper">
      
      {/* Main Fullscreen Form View */}
      <main className="form-main-container">
        <div className="form-card-container">

          {/* Card Header */}
          <div className="form-card-header">
            <div>

              <button
                className="round-back-btn"
                type="button"
                onClick={handleBack}
                title="Go Back"
                aria-label="Go Back"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '1.25rem' }}
                >
                  arrow_back
                </span>
              </button>

              <h1 className="font-headline-md text-on-surface font-semibold">
                Apply for Leave
              </h1>

              <p
                className="font-body-sm text-secondary"
                style={{ marginTop: '0.25rem' }}
              >
                Submit a new leave request for manager approval
              </p>

            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="form-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="form-success">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Leave Type */}
            <div className="form-group">

              <label
                className="form-label font-label-md text-on-surface"
                htmlFor="leave-type"
              >
                Leave Type <span className="text-error">*</span>
              </label>

              <div className="select-wrapper">

                <select
                  className="form-control font-body-md"
                  id="leave-type"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="Earned">
                    Earned Leave
                  </option>

                  <option value="Sick">
                    Sick Leave
                  </option>
                </select>

                <span
                  className="material-symbols-outlined select-icon text-secondary"
                  style={{ fontSize: '1.125rem' }}
                >
                  expand_more
                </span>

              </div>
            </div>

            {/* Dates */}
            <div className="form-group">

              <div className="form-label-row">

                <label className="font-label-md text-on-surface font-semibold">
                  Dates <span className="text-error">*</span>
                </label>

                <span className="duration-badge font-label-sm font-semibold">
                  Duration: {duration}{' '}
                  {duration === 1 ? 'Day' : 'Days'}
                </span>

              </div>

              <div className="date-grid">

                <div>
                  <span
                    className="font-label-sm text-secondary"
                    style={{
                      display: 'block',
                      marginBottom: '0.25rem',
                      textTransform: 'none'
                    }}
                  >
                    Start Date
                  </span>

                  <input
                    className="form-control font-body-md text-on-surface"
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <span
                    className="font-label-sm text-secondary"
                    style={{
                      display: 'block',
                      marginBottom: '0.25rem',
                      textTransform: 'none'
                    }}
                  >
                    End Date
                  </span>

                  <input
                    className="form-control font-body-md text-on-surface"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) =>
                      setEndDate(e.target.value)
                    }
                    required
                  />
                </div>

              </div>
            </div>

            {/* Reason */}
            <div className="form-group">

              <label
                className="form-label font-label-md text-on-surface"
                htmlFor="reason"
              >
                Reason for Leave{' '}
                <span className="text-error">*</span>
              </label>

              <textarea
                className="form-control form-textarea font-body-md text-on-surface"
                id="reason"
                placeholder="e.g., Attending family wedding, recovery from medical procedure..."
                rows="4"
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                required
              />

            </div>

            {/* Supporting Documents */}
            <div className="form-group">

              <label className="form-label font-label-md text-on-surface">
                Supporting Documents
              </label>

              <div className="upload-box">

                <div className="upload-icon-wrap text-secondary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1.5rem' }}
                  >
                    upload_file
                  </span>
                </div>

                <p className="font-label-md text-on-surface font-semibold">
                  Click to upload or drag &amp; drop
                </p>

                <p
                  className="font-label-sm text-secondary"
                  style={{
                    textTransform: 'none',
                    marginTop: '0.25rem'
                  }}
                >
                  Upload medical note or documents (PDF, PNG up to 5MB)
                </p>

              </div>
            </div>

            {/* Footer Buttons */}
            <div className="form-card-footer">

              <button
                className="btn-submit font-label-lg font-semibold"
                type="submit"
                disabled={isSubmitting}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '1.125rem' }}
                >
                  send
                </span>

                <span>
                  {isSubmitting
                    ? 'Submitting...'
                    : 'Submit Application'}
                </span>
              </button>

              <button
                className="btn-cancel font-label-md font-semibold"
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
