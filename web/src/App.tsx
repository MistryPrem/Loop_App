import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WebA11yProvider, useWebA11y } from './context/WebA11yContext';
import { Navigation } from './components/Navigation';
import { SimplePatientWeb } from './pages/SimplePatientWeb';
import { CaregiverFeedWeb } from './pages/CaregiverFeedWeb';
import { EmergencyWeb } from './pages/EmergencyWeb';
import { SettingsWeb } from './pages/SettingsWeb';

function AppContent() {
  const { simpleMode } = useWebA11y();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Routes>
          <Route path="/" element={simpleMode ? <SimplePatientWeb /> : <CaregiverFeedWeb />} />
          <Route path="/feed" element={<CaregiverFeedWeb />} />
          <Route path="/emergency" element={<EmergencyWeb />} />
          <Route path="/settings" element={<SettingsWeb />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WebA11yProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </WebA11yProvider>
  );
}
