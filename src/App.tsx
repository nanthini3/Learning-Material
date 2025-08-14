import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserLoginPage from "./pages/UserLoginPage";
import SetPasswordPage from "./pages/setPasswordPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import EditProfilePage from "./pages/EditProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import Rewards from "./pages/Rewards";
import ModuleProgress from "./pages/ModuleProgress";
import EmployeesPage from '@/pages/employees/Employee-Page';
import RegisterEmployeePage from '@/pages/employees/Register-Employee';
import { EmployeeSetPasswordPage } from './pages/employees/SetPasswordPage';
// Import with default export
import EmployeeDashboardPage from './pages/employees/EmployeeDashboardPage';
import EmployeeEditProfilePage from './pages/employees/EmployeeEditProfilePage';
import EmployeeChangePasswordPage from './pages/employees/EmployeeChangePasswordPage';
import ModulesPage from '@/pages/ModulesPages';
import AddModulePage from '@/pages/AddModulePage';
import EditModulePage from '@/pages/EditModulePage';

// Add the new My Courses page import
import MyCoursesPage from '@/pages/employees/MyCoursesPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* HR Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/module-progress" element={<ModuleProgress />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/register-employee" element={<RegisterEmployeePage />} />
        <Route path="/employee/set-password" element={<EmployeeSetPasswordPage />} />
        
        {/* Employee Routes */}
        <Route path="/employee/login" element={<UserLoginPage />} />
        <Route path="/employee/set-password" element={<SetPasswordPage />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/employee/profile" element={<EmployeeEditProfilePage />} />
        <Route path="/employee/change-password" element={<EmployeeChangePasswordPage />} />
        
        {/* Add the My Courses route */}
        <Route path="/employee/courses" element={<MyCoursesPage />} />
        
        {/* Legacy User Routes - Redirect to employee routes */}
        <Route path="/user/login" element={<Navigate to="/employee/login" replace />} />
        <Route path="/user/set-password" element={<Navigate to="/employee/set-password" replace />} />
        <Route path="/user/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
        
        {/* Other Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/add-module" element={<AddModulePage />} />
        <Route path="/edit-module/:id" element={<EditModulePage />} />
        
        {/* Redirect unknown routes to main login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;