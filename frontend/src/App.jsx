import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route pointing to the live operations control dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Fallback route redirecting all unknown paths to the Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
