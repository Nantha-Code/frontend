import "./Navbar.css";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const pendingCount = 0;

  return (
    <header className="app-header">
      <div className="header-container">

        <div className="logo-wrapper">
          <div className="brand-title">
            LeaveFlow
          </div>
        </div>

        <div className="user-actions">

          <button
            className="btn-icon"
            type="button"
          >
            <span className="material-symbols-outlined">
              notifications
            </span>

            {pendingCount > 0 && (
              <span className="notification-badge"></span>
            )}
          </button>

          <div className="user-profile">

            <div className="avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <span className="user-name">
                {user.name}
              </span>

              <span className="user-role">
                {user.role}
              </span>
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;  