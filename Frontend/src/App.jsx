import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Portfolio } from "./pages/Portfolio";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Services } from "./pages/Services";
import { About } from "./pages/About";
import { Testimonials } from "./pages/Testimonials";
import { Contact } from "./pages/Contact";
import { RequestService } from "./pages/RequestService";
import { ScrollToTop } from "./components/ScrollToTop";
import { CustomCursor } from "./components/CustomCursor";
import { ChatWidget } from "./components/ChatWidget";
import { useScrollReveal } from "./hooks/useScrollReveal";

import { ThemeProvider } from "./theme/ThemeContext";
import { ToastProvider } from "./components/toast/ToastContext";
import { AuthProvider } from "./portal/auth/AuthContext";
import { PortalLogin } from "./portal/PortalLogin";
import { PortalRegister } from "./portal/PortalRegister";
import { PortalForgotPassword } from "./portal/PortalForgotPassword";
import { PortalResetPassword } from "./portal/PortalResetPassword";
import { PortalLayout } from "./portal/PortalLayout";
import { ClientManagement } from "./portal/pages/ClientManagement";
import { DashboardRouter } from "./portal/pages/DashboardRouter";
import { RequestDetail } from "./portal/pages/RequestDetail";
import { Assessments } from "./portal/pages/Assessments";
import { AccountRouter } from "./portal/pages/AccountRouter";
import { Profile } from "./portal/pages/Profile";
import { NewRequestWizard } from "./portal/wizard/NewRequestWizard";
import { ServiceRequests } from "./portal/pages/ServiceRequests";
import { Quotations } from "./portal/pages/Quotations";
import { ProjectManagement } from "./portal/pages/ProjectManagement";
import { TasksResources } from "./portal/pages/TasksResources";
import { DesignFilesRouter } from "./portal/pages/DesignFilesRouter";
import { CustomerFeedback } from "./portal/pages/CustomerFeedback";
import { AnalyticsDashboard } from "./portal/pages/AnalyticsDashboard";
import { BusinessReport } from "./portal/pages/BusinessReport";
import { NotificationsHub } from "./portal/pages/NotificationsHub";
import { SecurityAccess } from "./portal/pages/SecurityAccess";
import { ProfessionalBackground } from "./portal/pages/ProfessionalBackground";
import { DesignerMonitor } from "./portal/pages/DesignerMonitor";
import { StaffHub } from "./portal/pages/StaffHub";
import { StaffDetail } from "./portal/pages/StaffDetail";
import { Compensation } from "./portal/pages/Compensation";
import { HomeController } from "./portal/pages/HomeController";

function PublicLayout() {
  useScrollReveal();
  return (
    <div id="top">
      <ScrollToTop />
      <CustomCursor />
      <Header />
      <Outlet />
      <Footer />
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public marketing site */}
            <Route path="/" element={<PublicLayout />}>
              <Route index                  element={<Home />} />
              <Route path="portfolio"       element={<Portfolio />} />
              <Route path="portfolio/:slug" element={<ProjectDetail />} />
              <Route path="services"        element={<Services />} />
              <Route path="about"           element={<About />} />
              <Route path="testimonials"    element={<Testimonials />} />
              <Route path="contact"         element={<Contact />} />
              <Route path="request"         element={<RequestService />} />
            </Route>

            {/* Auth pages (no sidebar) */}
            <Route path="/portal/login"           element={<PortalLogin />} />
            <Route path="/portal/register"        element={<PortalRegister />} />
            <Route path="/portal/forgot-password" element={<PortalForgotPassword />} />
            <Route path="/portal/reset-password"  element={<PortalResetPassword />} />

            {/* Protected portal (role-based sidebar rendered by PortalLayout) */}
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<Navigate to="requests" replace />} />
              <Route path="clients"       element={<ClientManagement />} />
              <Route path="dashboard"     element={<DashboardRouter />} />
              <Route path="professional-background" element={<ProfessionalBackground />} />
              <Route path="designer-monitor" element={<DesignerMonitor />} />
              <Route path="staff"         element={<StaffHub />} />
              <Route path="staff/:id"     element={<StaffDetail />} />
              <Route path="compensation"  element={<Compensation />} />
              <Route path="home-controller" element={<HomeController />} />
              <Route path="requests"      element={<ServiceRequests />} />
              <Route path="requests/new"      element={<NewRequestWizard />} />
              <Route path="requests/:id"      element={<RequestDetail />} />
              <Route path="assessments"   element={<Assessments />} />
              <Route path="account"       element={<AccountRouter />} />
              <Route path="profile"       element={<Profile />} />
              <Route path="quotations"    element={<Quotations />} />
              <Route path="projects"      element={<ProjectManagement />} />
              <Route path="tasks"         element={<TasksResources />} />
              <Route path="design-files"  element={<DesignFilesRouter />} />
              <Route path="feedback"      element={<CustomerFeedback />} />
              <Route path="analytics"     element={<AnalyticsDashboard />} />
              <Route path="reports"       element={<BusinessReport />} />
              <Route path="notifications" element={<NotificationsHub />} />
              <Route path="security"      element={<SecurityAccess />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
