import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import PatientLogin from './pages/auth/PatientLogin';
import DoctorLogin from './pages/auth/DoctorLogin';
import ResearcherLogin from './pages/auth/ResearcherLogin';
import AdminLogin from './pages/auth/AdminLogin';
import PatientRegistration from './pages/auth/PatientRegistration';
import DoctorRegistration from './pages/auth/DoctorRegistration';
import ResearcherRegistration from './pages/auth/ResearcherRegistration';
import PendingApproval from './pages/auth/PendingApproval';

// Dashboards
import PatientDashboard from './pages/dashboards/patient/PatientDashboard';
import DoctorDashboard from './pages/dashboards/doctor/DoctorDashboard';
import AdminDashboard from './pages/dashboards/admin/AdminDashboard';
import ResearcherDashboard from './pages/dashboards/researcher/ResearcherDashboard';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login/patient", element: <PatientLogin /> },
      { path: "/login/doctor", element: <DoctorLogin /> },
      { path: "/login/researcher", element: <ResearcherLogin /> },
      { path: "/login/admin", element: <AdminLogin /> },
      { path: "/register/patient", element: <PatientRegistration /> },
      { path: "/register/doctor", element: <DoctorRegistration /> },
      { path: "/register/researcher", element: <ResearcherRegistration /> },
      { path: "/pending-approval", element: <PendingApproval /> },
    ],
  },
  {
    element: <DashboardLayout role="patient" />,
    children: [
      { path: "/patient/*", element: <PatientDashboard /> },
    ],
  },
  {
    element: <DashboardLayout role="doctor" />,
    children: [
      { path: "/doctor/*", element: <DoctorDashboard /> },
    ],
  },
  {
    element: <DashboardLayout role="admin" />,
    children: [
      { path: "/admin/*", element: <AdminDashboard /> },
    ],
  },
  {
    element: <DashboardLayout role="researcher" />,
    children: [
      { path: "/researcher/*", element: <ResearcherDashboard /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
