# LeaveFlow – Leave Management MVP

LeaveFlow is a full-stack Leave Management MVP designed for organizations with two key roles: **Employee** and **Manager**.

Employees can view leave balances, submit leave applications, track request status/history, and cancel pending requests. Managers can review incoming leave applications and approve or reject them.

---

## 1. Technology Stack

### Frontend
* **Core:** React, Vite, JavaScript (ES6+)
* **Routing & UI:** React Router, HTML5, CSS3

### Backend
* **Runtime & Framework:** Node.js, Express.js
* **Security & Auth:** JWT (JSON Web Tokens), bcryptjs
* **Utilities:** CORS, dotenv

### Database
* **Database Engine:** PostgreSQL
* **Driver:** `pg` (node-postgres)

### Tooling
* Git, GitHub, VS Code, Postman / cURL

---

## 2. Project Structure

```text
LeaveFlow/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── config/
    │   └── db.js
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── .env
    ├── server.js
    └── package.json



3. Architecture Overview
React Frontend
      │
      │ HTTP / REST API
      ▼
Express.js Backend
      │
      ├── Authentication & JWT Middleware
      ├── Route Controllers
      └── Database Models
      │
      ▼
PostgreSQL Database
