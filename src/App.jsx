import './App.css';

import EmpProfile from './pages/EmpProfile';
import LeaveForm from './pages/LeaveForm';
import LeaveRequest from './pages/LeaveRequest';
import LoginPage from './pages/LoginPage';
import ManagerProfile from './pages/ManagerProfile';
import OverView from './pages/OverView';

import {
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Navbar from "./components/Navbar";


// =====================================================
// Get logged-in user
// =====================================================

function getStoredUser() {
  try {
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}


// =====================================================
// Employee Route Protection
// =====================================================

function EmployeeRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'employee') {
    return <Navigate to="/overview" replace />;
  }

  return children;
}


// =====================================================
// Manager Route Protection
// =====================================================

function ManagerRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'manager') {
    return <Navigate to="/" replace />;
  }

  return children;
}


// =====================================================
// App
// =====================================================

function App() {

  const location = useLocation();

  // Navbar should appear only on Employee pages
  const employeePages = [
    "/",
    "/leave-form"
  ];

  const showNavbar = employeePages.includes(location.pathname);

  return (
    <>
      {/* Show Navbar only for Employee pages */}
      {showNavbar && <Navbar />}

      <Routes>

        {/* =================================================
            Public Route
            ================================================= */}

        <Route path="/login" element={<LoginPage />}/>


        {/* =================================================
            Employee Routes
            ================================================= */}

        <Route path="/" element={<EmployeeRoute> <EmpProfile /> </EmployeeRoute>}/>

        <Route path="/leave-form" element={ <EmployeeRoute> <LeaveForm /> </EmployeeRoute>}/>


        {/* =================================================
            Manager Routes
            ================================================= */}

        <Route path="/leave-request" element={ <ManagerRoute> <LeaveRequest /> </ManagerRoute>}/>

        <Route path="/overview" element={<ManagerRoute> <OverView /> </ManagerRoute>}/>

        <Route path ="/manager-profile"element={<ManagerRoute> <ManagerProfile /> </ManagerRoute>}/>


        {/* =================================================
            Unknown URL
            ================================================= */}

        <Route path ="*" element={<Navigate to="/login" replace />}/>

      </Routes>
    </>
  );
}

export default App;