import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TargetsListPage from './pages/TargetsListPage';
import AssessmentsListPage from './pages/AssessmentsListPage';
import NewAssessmentPage from './pages/NewAssessmentPage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import AttackSurfacePage from './pages/AttackSurfacePage';
import SecurityChecksPage from './pages/SecurityChecksPage';
import FindingsListPage from './pages/FindingsListPage';
import FindingDetailPage from './pages/FindingDetailPage';
import EvidencePage from './pages/EvidencePage';
import RemediationPage from './pages/RemediationPage';
import RetestingPage from './pages/RetestingPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated SOC Shell */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Target Routes */}
            <Route path="/targets" element={<TargetsListPage />} />

            {/* Assessment Routes */}
            <Route path="/assessments" element={<AssessmentsListPage />} />
            <Route path="/assessments/new" element={<NewAssessmentPage />} />
            <Route path="/assessments/:id" element={<AssessmentDetailPage />} />

            {/* Surface & Checks */}
            <Route path="/attack-surface" element={<AttackSurfacePage />} />
            <Route path="/security-checks" element={<SecurityChecksPage />} />

            {/* Findings & Evidence */}
            <Route path="/findings" element={<FindingsListPage />} />
            <Route path="/findings/:id" element={<FindingDetailPage />} />
            <Route path="/evidence" element={<EvidencePage />} />

            {/* Closed Loop: Remediation & Retesting */}
            <Route path="/remediation" element={<RemediationPage />} />
            <Route path="/retesting" element={<RetestingPage />} />

            {/* Reporting & Settings */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
