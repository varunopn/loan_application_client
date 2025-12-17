// ============================================
// Main App Component with Routing
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { OtpPage } from './pages/OtpPage';
import { ConsentPage } from './pages/ConsentPage';
import { PinSetupPage } from './pages/PinSetupPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { LoanApplicationPage } from './pages/LoanApplicationPage';
import { LoanReviewPage } from './pages/LoanReviewPage';
import { LoanResultPage } from './pages/LoanResultPage';
import { ESignaturePage } from './pages/ESignaturePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { DemoControlsPage } from './pages/DemoControlsPage';

import './App.css';

function App() {
  return (
    <BrowserRouter basename="/loan_application_client">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/otp" element={<OtpPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/pin" element={<PinSetupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/loan/new"
          element={
            <PrivateRoute>
              <LoanApplicationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/loan/review"
          element={
            <PrivateRoute>
              <LoanReviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/loan/result"
          element={
            <PrivateRoute>
              <LoanResultPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/loan/esign"
          element={
            <PrivateRoute>
              <ESignaturePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/demo"
          element={
            <PrivateRoute>
              <DemoControlsPage />
            </PrivateRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
