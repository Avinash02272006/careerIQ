import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing/Landing";
import ResumeUpload from "./pages/ResumeUpload/ResumeUpload";
import Dashboard from "./pages/Dashboard/Dashboard";
import Auth from "./pages/Auth/Auth";
import RoleExplorer from "./pages/RoleExplorer/RoleExplorer";
import CareerSimulator from "./pages/Simulator/CareerSimulator";
import CareerUniverse from "./pages/Universe/CareerUniverse";
import Interview from "./pages/Interview/Interview";
import JobMatching from "./pages/JobMatching/JobMatching";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Core Requested Platform Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/resume-analyzer" element={<ResumeUpload />} />
          <Route path="/analyzer" element={<ResumeUpload />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/mock-interview" element={<Interview />} />
          <Route path="/job-matching" element={<JobMatching />} />
          <Route path="/jobs" element={<JobMatching />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Complementary Exploration & Auth Pages */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/roles" element={<RoleExplorer />} />
          <Route path="/simulator" element={<CareerSimulator />} />
          <Route path="/universe" element={<CareerUniverse />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
