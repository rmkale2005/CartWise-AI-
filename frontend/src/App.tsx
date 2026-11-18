import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { DatasetManagement } from './pages/DatasetManagement';
import { DataExploration } from './pages/DataExploration';
import { CustomerBehaviour } from './pages/CustomerBehaviour';
import { CartAbandonment } from './pages/CartAbandonment';
import { PredictionPlayground } from './pages/PredictionPlayground';
import { CustomerSegmentation } from './pages/CustomerSegmentation';
import { ModelPerformance } from './pages/ModelPerformance';
import { BusinessInsights } from './pages/BusinessInsights';
import { AcademicReport } from './pages/AcademicReport';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Shell with Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dataset" element={<DatasetManagement />} />
          <Route path="/eda" element={<DataExploration />} />
          <Route path="/behaviour" element={<CustomerBehaviour />} />
          <Route path="/abandonment" element={<CartAbandonment />} />
          <Route path="/prediction" element={<PredictionPlayground />} />
          <Route path="/segmentation" element={<CustomerSegmentation />} />
          <Route path="/model-performance" element={<ModelPerformance />} />
          <Route path="/insights" element={<BusinessInsights />} />
          <Route path="/about" element={<AcademicReport />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
