import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute, { RoleRoute } from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import BRSRReport from "./pages/BRSRReport.jsx";
import Consolidation from "./pages/Consolidation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ESGDashboard from "./pages/ESGDashboard.jsx";
import ESGSubmission from "./pages/ESGSubmission.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";
import Login from "./pages/Login.jsx";
import MonthlyComparison from "./pages/MonthlyComparison.jsx";
import MySubmissions from "./pages/MySubmissions.jsx";
import Notifications from "./pages/Notifications.jsx";
import ProjectDashboard from "./pages/ProjectDashboard.jsx";
import ProjectPerformance from "./pages/ProjectPerformance.jsx";
import ReviewApproval from "./pages/ReviewApproval.jsx";
import SubmissionDetails from "./pages/SubmissionDetails.jsx";
import { ROLE_HOME_PATH, ROLES } from "./utils/constants.js";

function AppLayout() {
  const { user } = useAuth();
  return (
    <div className="app-frame">
      <Navbar />
      <div className="app-layout">
        <Sidebar role={user?.role} />
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={ROLE_HOME_PATH[user?.role] || "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route element={<RoleRoute allowedRoles={[ROLES.REVIEWER, ROLES.ADMIN]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={[ROLES.PROJECT_USER]} />}>
                <Route path="/project-dashboard" element={<ProjectDashboard />} />
                <Route path="/esg-submission" element={<ESGSubmission />} />
                <Route path="/esg-submission/:id/edit" element={<ESGSubmission />} />
                <Route path="/my-submissions" element={<MySubmissions />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={[ROLES.REVIEWER]} />}>
                <Route path="/submissions" element={<MySubmissions />} />
                <Route path="/review-approval" element={<ReviewApproval />} />
                <Route path="/review-approval/:id" element={<ReviewApproval />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route path="/consolidation" element={<Consolidation />} />
                <Route path="/brsr-report" element={<BRSRReport />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={[ROLES.PROJECT_USER, ROLES.REVIEWER, ROLES.ADMIN]} />}>
                <Route path="/esg-dashboard" element={<ESGDashboard />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={[ROLES.PROJECT_USER, ROLES.ADMIN]} />}>
                <Route path="/monthly-comparison" element={<MonthlyComparison />} />
                <Route path="/project-performance" element={<ProjectPerformance />} />
                <Route path="/project-performance/:projectId" element={<ProjectPerformance />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={[ROLES.REVIEWER, ROLES.ADMIN, ROLES.PROJECT_USER]} />}>
                <Route path="/submissions/:id" element={<SubmissionDetails />} />
              </Route>
              <Route path="*" element={<HomeRedirect />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}