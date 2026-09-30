import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save login information
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));

      // Redirect according to backend role
      if (data.user.role === 'employee') {
        navigate('/');
      } else if (data.user.role === 'manager') {
        navigate('/overview');
      } else {
        throw new Error('Invalid user role');
      }

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper">

      <div className="login-card">

        {/* Brand Header */}
        <div className="brand-header">

          <div className="brand-badge-row">
            <div className="brand-logo-box">
              <svg
                className="brand-logo-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4.5 12.75l6 6 9-13.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span className="brand-title">LeaveFlow</span>
          </div>

          <h1 className="login-heading">
            Sign in to LeaveFlow
          </h1>

          <p className="login-subtitle">
            Enter your credentials to access your leave portal
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="login-error">
            {errorMessage}
          </div>
        )}

        {/* Sign In Form */}
        <form
          className="login-form"
          onSubmit={handleFormSubmit}
        >

          {/* Email */}
          <div>
            <label
              className="field-label"
              htmlFor="workEmail"
            >
              Work Email
            </label>

            <div className="input-container">

              <div className="input-icon-wrap">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px' }}
                >
                  mail
                </span>
              </div>

              <input
                autoComplete="email"
                className="form-input"
                id="workEmail"
                name="email"
                placeholder="Enter your email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>
          </div>

          {/* Password */}
          <div>

            <div className="password-label-row">

              <label
                className="field-label"
                htmlFor="password"
              >
                Password
              </label>

              <span className="forgot-link">
                Forgot password?
              </span>

            </div>

            <div className="input-container">

              <div className="input-icon-wrap">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px' }}
                >
                  lock
                </span>
              </div>

              <input
                autoComplete="current-password"
                className="form-input password-field"
                id="password"
                name="password"
                placeholder="••••••••••••"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                className="btn-toggle-password"
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>

            </div>
          </div>

          {/* Remember Me */}
          <div className="checkbox-row">

            <input
              className="form-checkbox"
              id="rememberMe"
              name="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
            />

            <label
              className="checkbox-label"
              htmlFor="rememberMe"
            >
              Remember this device
            </label>

          </div>

          {/* Sign In Button */}
          <div style={{ paddingTop: '0.5rem' }}>

            <button
              className="btn-primary-signin"
              disabled={isSubmitting}
              type="submit"
            >

              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin arrow-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>

                  <svg
                    className="arrow-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

